import jwt
from typing import Optional
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_password, get_password_hash
from app.models.models import User, Role, Student, Department, StaffClassAssignment, LoginHistory
from app.schemas.schemas import (
    LoginRequest, TokenResponse, UserResponse,
    StudentLoginRequest, ParentLoginRequest, StudentTokenResponse, ChangePasswordRequest
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def normalize_dept_code(code: Optional[str]) -> str:
    if not code:
        return ""
    c = code.strip().upper().replace(" ", "").replace("&", "")
    if c in ["AIDS", "ARTIFICIALINTELLIGENCEANDDATASCIENCE"]:
        return "AIDS"
    if c in ["AIML", "ARTIFICIALINTELLIGENCEANDMACHINELEARNING"]:
        return "AIML"
    if c in ["CSBS", "COMPUTERSCIENCEANDBUSINESSSYSTEM"]:
        return "CSBS"
    if c in ["CCE", "COMPUTERANDCOMMUNICATIONENGINEERING"]:
        return "CCE"
    if c in ["CSE", "COMPUTERSCIENCEANDENGINEERING"]:
        return "CSE"
    if c in ["IT", "INFORMATIONTECHNOLOGY"]:
        return "IT"
    if c in ["ECE", "ELECTRONICSANDCOMMUNICATIONENGINEERING"]:
        return "ECE"
    if c in ["EEE", "ELECTRICALANDELECTRONICSENGINEERING"]:
        return "EEE"
    if c in ["MECH", "MECHANICALENGINEERING"]:
        return "MECH"
    if c in ["CHEM", "CHEMICALENGINEERING"]:
        return "CHEM"
    if c in ["CIVIL", "CIVILENGINEERING"]:
        return "CIVIL"
    return c


# ─────────────────────────────────────────────────────────────────────────────
# STAFF / HOD / PRINCIPAL / ADMIN LOGIN  (Employee ID + Password)
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    query_id = (payload.login_id or payload.email or "").strip()
    selected_dept_code = (getattr(payload, 'department_code', None) or "").strip().upper()
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown Device")

    if not query_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID or Email is required"
        )

    # 1. Find User in DB by User ID / Employee ID / Email
    user = db.query(User).filter(
        or_(User.email.ilike(query_id), User.employee_id.ilike(query_id))
    ).first()

    if not user:
        # Audit Log Failed Attempt
        log_entry = LoginHistory(
            employee_id=query_id,
            role_name=payload.portal_role,
            department_code=selected_dept_code,
            ip_address=client_ip,
            device_info=user_agent[:250],
            is_success=False,
            failure_reason="User ID not found"
        )
        db.add(log_entry)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Employee ID / Email or Password"
        )

    role_name = user.role.name if user.role else (payload.portal_role or "STAFF")
    user_dept_code = user.department.code.upper() if user.department else None

    # 2. Check Account Status (Active vs Inactive/Suspended)
    if not user.is_active or (user.status and user.status.lower() in ["inactive", "suspended"]):
        log_entry = LoginHistory(
            user_id=user.id,
            employee_id=user.employee_id,
            role_name=role_name,
            department_code=user_dept_code,
            ip_address=client_ip,
            device_info=user_agent[:250],
            is_success=False,
            failure_reason="Account is inactive or suspended"
        )
        db.add(log_entry)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is currently inactive. Please contact the administrator."
        )

    # 3. Verify BCrypt Password
    if not verify_password(payload.password, user.password_hash):
        log_entry = LoginHistory(
            user_id=user.id,
            employee_id=user.employee_id,
            role_name=role_name,
            department_code=user_dept_code,
            ip_address=client_ip,
            device_info=user_agent[:250],
            is_success=False,
            failure_reason="Incorrect password"
        )
        db.add(log_entry)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Employee ID / Email or Password"
        )

    # 4. Department Authorization Rule (Rule 8)
    # HOD and Staff accounts are strictly bound to their database assigned department.
    if role_name in ["HOD", "STAFF"]:
        if selected_dept_code and user_dept_code:
            norm_selected = normalize_dept_code(selected_dept_code)
            norm_user = normalize_dept_code(user_dept_code)
            if norm_selected != norm_user:
                log_entry = LoginHistory(
                    user_id=user.id,
                    employee_id=user.employee_id,
                    role_name=role_name,
                    department_code=selected_dept_code,
                    ip_address=client_ip,
                    device_info=user_agent[:250],
                    is_success=False,
                    failure_reason=f"Department mismatch: Selected {selected_dept_code}, Authorized for {user_dept_code}"
                )
                db.add(log_entry)
                db.commit()

                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your account is not authorized for the selected department."
                )

    # 5. Retrieve Staff Class Assignments
    assigned_classes_list = []
    if role_name == "STAFF":
        assignments = db.query(StaffClassAssignment).filter(
            StaffClassAssignment.user_id == user.id,
            StaffClassAssignment.status == "Active"
        ).all()
        for assign in assignments:
            dept = db.query(Department).filter(Department.id == assign.department_id).first()
            assigned_classes_list.append({
                "assignment_id": assign.id,
                "department_id": assign.department_id,
                "department_code": dept.code if dept else "N/A",
                "department_name": dept.name if dept else "N/A",
                "year": assign.year,
                "section": assign.section_name,
                "is_class_advisor": assign.is_class_advisor
            })

    # 6. Log Successful Login & Update Last Login Timestamp
    log_entry = LoginHistory(
        user_id=user.id,
        employee_id=user.employee_id,
        role_name=role_name,
        department_code=user_dept_code,
        ip_address=client_ip,
        device_info=user_agent[:250],
        is_success=True,
        failure_reason=None
    )
    db.add(log_entry)

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    # 7. Issue JWT Token
    dept_id = user.department_id
    dept_name = user.department.name if user.department else None

    token = create_access_token({
        "sub": user.id,
        "user_id": user.id,
        "employee_id": user.employee_id,
        "email": user.email,
        "role": role_name,
        "department_id": dept_id,
        "department_code": user_dept_code,
        "assigned_classes": assigned_classes_list,
        "type": "staff"
    })

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        employee_id=user.employee_id,
        full_name=user.full_name,
        role=role_name,
        email=user.email,
        department_id=dept_id,
        department_code=user_dept_code,
        department_name=dept_name,
        assigned_classes=assigned_classes_list
    )


# ─────────────────────────────────────────────────────────────────────────────
# STUDENT LOGIN  (Register Number + Password)
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/student-login", response_model=StudentTokenResponse)
def student_login(payload: StudentLoginRequest, db: Session = Depends(get_db)):
    register_number = (payload.register_number or "").strip()
    if not register_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Register Number is required"
        )

    student = db.query(Student).filter(
        Student.register_number == register_number
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Register Number or Password"
        )

    # If no password set yet, allow first-time login with register number as password
    expected_hash = student.student_password_hash or hash_password(register_number)
    if expected_hash != hash_password(payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Register Number or Password"
        )

    if student.status != "Active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student account is not active"
        )

    token = create_access_token({
        "sub": student.id,
        "register_number": student.register_number,
        "role": "STUDENT",
        "type": "student"
    })

    dept = student.department
    return StudentTokenResponse(
        access_token=token,
        student_id=student.id,
        register_number=student.register_number,
        full_name=student.full_name,
        role="STUDENT",
        department_code=dept.code if dept else "N/A",
        department_name=dept.name if dept else "N/A",
        current_year=student.current_year,
        current_semester=student.current_semester,
        first_login=student.first_login
    )


# ─────────────────────────────────────────────────────────────────────────────
# CHANGE PASSWORD  (Student changes password on first login or voluntary)
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/change-student-password")
def change_student_password(payload: ChangePasswordRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(
        Student.register_number == payload.register_number
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Verify old password
    old_hash = student.student_password_hash or hash_password(payload.register_number)
    if old_hash != hash_password(payload.old_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    student.student_password_hash = hash_password(payload.new_password)
    student.first_login = False
    db.commit()

    return {"message": "Password changed successfully. Please log in again with your new password."}


@router.get("/me", response_model=UserResponse)
def get_me(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
