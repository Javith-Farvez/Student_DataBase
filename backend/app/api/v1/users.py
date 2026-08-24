from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.models import User, Role, Department, StaffClassAssignment, LoginHistory, PasswordResetHistory, AuditLog

router = APIRouter(prefix="/users", tags=["Admin User Management"])


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class StaffClassAssignmentInput(BaseModel):
    year: int # 1, 2, 3, 4
    section_name: str # A, B, C, D
    is_class_advisor: Optional[bool] = False

class UserCreatePayload(BaseModel):
    role: str # ADMIN, PRINCIPAL, HOD, STAFF
    department_code: Optional[str] = None # IT, CSE, AIDS, AIML, CSBS, CCE, ECE, EEE, MECH, CHEM, CIVIL
    employee_id: str # HOD_CSE_001, STAFF_AIDS_001, etc.
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    password: str
    confirm_password: str
    assigned_classes: Optional[List[StaffClassAssignmentInput]] = []

class UserUpdatePayload(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    department_code: Optional[str] = None

class StatusUpdatePayload(BaseModel):
    status: str # Active, Inactive, Suspended

class PasswordResetPayload(BaseModel):
    new_password: str
    confirm_password: str

class ClassAssignmentsUpdatePayload(BaseModel):
    assigned_classes: List[StaffClassAssignmentInput]


# ─── API Endpoints ────────────────────────────────────────────────────────────

@router.get("")
def list_users(
    role: Optional[str] = None,
    department_code: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all user accounts in the ERP database with their role, department, status, and class assignments.
    """
    query = db.query(User)

    if role:
        role_obj = db.query(Role).filter(Role.name.ilike(role)).first()
        if role_obj:
            query = query.filter(User.role_id == role_obj.id)

    if department_code and department_code.upper() != "ALL":
        dept_obj = db.query(Department).filter(Department.code.ilike(department_code)).first()
        if dept_obj:
            query = query.filter(User.department_id == dept_obj.id)

    if status:
        query = query.filter(User.status.ilike(status))

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.employee_id.ilike(s),
                User.full_name.ilike(s),
                User.email.ilike(s),
                User.phone.ilike(s)
            )
        )

    users = query.order_by(User.created_at.desc()).all()
    results = []

    for u in users:
        role_name = u.role.name if u.role else "STAFF"
        dept_code = u.department.code if u.department else "ALL"
        dept_name = u.department.name if u.department else "All Departments"

        # Fetch Staff Class Assignments
        assignments = db.query(StaffClassAssignment).filter(
            StaffClassAssignment.user_id == u.id,
            StaffClassAssignment.status == "Active"
        ).all()

        class_list = [
            {
                "id": a.id,
                "year": a.year,
                "section": a.section_name,
                "is_class_advisor": a.is_class_advisor
            } for a in assignments
        ]

        results.append({
            "id": u.id,
            "user_id": u.employee_id,
            "employee_id": u.employee_id,
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "designation": u.designation,
            "role": role_name,
            "department_code": dept_code,
            "department_name": dept_name,
            "department_id": u.department_id,
            "status": u.status or ("Active" if u.is_active else "Inactive"),
            "is_active": u.is_active,
            "last_login": u.last_login.isoformat() if u.last_login else None,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "assigned_classes": class_list
        })

    return results


@router.post("", status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreatePayload, db: Session = Depends(get_db)):
    """
    Admin Creates Account for Principal, HOD, or Staff.
    Enforces password match, unique User ID, BCrypt hashing, and staff class assignments.
    """
    # 1. Password confirmation check
    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password and Confirm Password do not match."
        )

    if len(payload.password) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 4 characters long."
        )

    # 2. Check User ID / Employee ID uniqueness
    emp_id = payload.employee_id.strip().upper()
    existing_user = db.query(User).filter(
        or_(User.employee_id == emp_id, User.email == (payload.email or f"{emp_id.lower()}@vsb.ac.in"))
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User ID '{emp_id}' already exists in database. User ID must be unique."
        )

    # 3. Get Role
    role_key = payload.role.strip().upper()
    if role_key not in ["ADMIN", "PRINCIPAL", "HOD", "STAFF"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be one of: ADMIN, PRINCIPAL, HOD, STAFF"
        )

    role_obj = db.query(Role).filter(Role.name == role_key).first()
    if not role_obj:
        role_obj = Role(name=role_key, description=f"{role_key} Role")
        db.add(role_obj)
        db.flush()

    # 4. Get Department
    dept_obj = None
    if role_key in ["HOD", "STAFF"]:
        if not payload.department_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Department is required for {role_key} accounts."
            )
        dept_code = payload.department_code.strip().upper()
        dept_obj = db.query(Department).filter(Department.code == dept_code).first()
        if not dept_obj:
            dept_obj = Department(code=dept_code, name=f"Department of {dept_code}")
            db.add(dept_obj)
            db.flush()
    elif payload.department_code and payload.department_code.upper() != "ALL":
        dept_code = payload.department_code.strip().upper()
        dept_obj = db.query(Department).filter(Department.code == dept_code).first()

    # 5. Create User Entity with BCrypt Hashed Password
    user_email = payload.email.strip() if payload.email else f"{emp_id.lower()}@vsb.ac.in"
    hashed_pass = get_password_hash(payload.password)

    new_user = User(
        employee_id=emp_id,
        email=user_email,
        phone=payload.phone.strip() if payload.phone else None,
        password_hash=hashed_pass,
        role_id=role_obj.id,
        department_id=dept_obj.id if dept_obj else None,
        full_name=payload.full_name.strip(),
        designation=payload.designation.strip() if payload.designation else f"VSB {role_key}",
        status="Active",
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # 6. For Staff accounts, assign classes if provided
    created_assignments = []
    if role_key == "STAFF" and payload.assigned_classes:
        for cls in payload.assigned_classes:
            assign = StaffClassAssignment(
                user_id=new_user.id,
                department_id=dept_obj.id if dept_obj else new_user.department_id,
                year=cls.year,
                section_name=cls.section_name.upper(),
                is_class_advisor=cls.is_class_advisor or False,
                status="Active"
            )
            db.add(assign)
            created_assignments.append({
                "year": cls.year,
                "section": cls.section_name.upper()
            })

    db.commit()
    db.refresh(new_user)

    return {
        "message": f"{role_key} account '{emp_id}' created successfully.",
        "user_id": new_user.employee_id,
        "role": role_key,
        "department": dept_obj.code if dept_obj else "ALL",
        "assigned_classes": created_assignments
    }


@router.put("/{user_id}")
def update_user(user_id: str, payload: UserUpdatePayload, db: Session = Depends(get_db)):
    """
    Admin Edits User Details & Department Assignment.
    """
    user = db.query(User).filter((User.id == user_id) | (User.employee_id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.email is not None:
        user.email = payload.email.strip()
    if payload.phone is not None:
        user.phone = payload.phone.strip()
    if payload.designation is not None:
        user.designation = payload.designation.strip()
    if payload.department_code is not None:
        if payload.department_code.upper() == "ALL":
            user.department_id = None
        else:
            dept = db.query(Department).filter(Department.code == payload.department_code.upper()).first()
            if dept:
                user.department_id = dept.id

    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": f"User '{user.employee_id}' updated successfully."}


@router.put("/{user_id}/status")
def update_user_status(user_id: str, payload: StatusUpdatePayload, db: Session = Depends(get_db)):
    """
    Admin Deactivates, Activates, or Suspends Account.
    """
    user = db.query(User).filter((User.id == user_id) | (User.employee_id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    new_status = payload.status.capitalize()
    if new_status not in ["Active", "Inactive", "Suspended"]:
        raise HTTPException(status_code=400, detail="Status must be 'Active', 'Inactive', or 'Suspended'.")

    user.status = new_status
    user.is_active = (new_status == "Active")
    user.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {"message": f"Account status for '{user.employee_id}' changed to {new_status}."}


@router.post("/{user_id}/reset-password")
def reset_user_password(user_id: str, payload: PasswordResetPayload, db: Session = Depends(get_db)):
    """
    Admin Resets a User's Password with BCrypt Hashing.
    """
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="New password and Confirm Password do not match.")

    if len(payload.new_password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters long.")

    user = db.query(User).filter((User.id == user_id) | (User.employee_id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.password_hash = get_password_hash(payload.new_password)
    user.updated_at = datetime.now(timezone.utc)

    reset_log = PasswordResetHistory(
        user_id=user.id,
        reset_reason="Admin Manual Password Reset"
    )
    db.add(reset_log)
    db.commit()

    return {"message": f"Password for '{user.employee_id}' has been reset successfully."}


@router.post("/{user_id}/class-assignments")
def update_staff_class_assignments(user_id: str, payload: ClassAssignmentsUpdatePayload, db: Session = Depends(get_db)):
    """
    Admin Assigns Classes (Year 1-4, Section A/B/C/D) to Staff.
    """
    user = db.query(User).filter((User.id == user_id) | (User.employee_id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Remove existing active assignments
    db.query(StaffClassAssignment).filter(StaffClassAssignment.user_id == user.id).delete()

    dept_id = user.department_id or db.query(Department).first().id

    created_assignments = []
    for cls in payload.assigned_classes:
        assign = StaffClassAssignment(
            user_id=user.id,
            department_id=dept_id,
            year=cls.year,
            section_name=cls.section_name.upper(),
            is_class_advisor=cls.is_class_advisor or False,
            status="Active"
        )
        db.add(assign)
        created_assignments.append({
            "year": cls.year,
            "section": cls.section_name.upper()
        })

    db.commit()
    return {
        "message": f"Assigned classes updated for Staff '{user.employee_id}'.",
        "assigned_classes": created_assignments
    }


@router.get("/login-history")
def get_login_history(limit: int = 50, db: Session = Depends(get_db)):
    """
    Admin Views Login History and Failed Authorization Attempts.
    """
    logs = db.query(LoginHistory).order_by(LoginHistory.login_time.desc()).limit(limit).all()
    results = []
    for l in logs:
        results.append({
            "id": l.id,
            "user_id": l.employee_id,
            "role": l.role_name,
            "department_code": l.department_code,
            "login_time": l.login_time.isoformat() if l.login_time else None,
            "ip_address": l.ip_address,
            "device_info": l.device_info,
            "is_success": l.is_success,
            "failure_reason": l.failure_reason
        })
    return results
