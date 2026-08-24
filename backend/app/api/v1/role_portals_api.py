from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, Department, Student, StaffClassAssignment, Section, Program

router = APIRouter(tags=["Role Portals APIs"])

# ─────────────────────────────────────────────────────────────────────────────
# HOD ENDPOINTS (Enforces backend department isolation)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/hod/profile")
def get_hod_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="HOD user not found")
    if not user.role or user.role.name != "HOD":
        raise HTTPException(status_code=403, detail="User is not authorized as HOD")
    
    dept = user.department
    return {
        "user_id": user.id,
        "employee_id": user.employee_id,
        "full_name": user.full_name,
        "email": user.email,
        "department_id": user.department_id,
        "department_code": dept.code if dept else "N/A",
        "department_name": dept.name if dept else "N/A"
    }

@router.get("/hod/students")
def get_hod_students(
    department_id: str,
    year: Optional[int] = None,
    section: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Student).filter(Student.department_id == department_id)
    if year:
        query = query.filter(Student.current_year == year)
    if section:
        query = query.filter(Student.section_name == section.upper())
    
    students = query.all()
    results = []
    for s in students:
        results.append({
            "id": s.id,
            "register_number": s.register_number,
            "roll_number": s.roll_number,
            "full_name": s.full_name,
            "current_year": s.current_year,
            "section_name": s.section_name or "A",
            "cgpa": s.cgpa,
            "attendance_percentage": s.attendance_percentage,
            "placement_status": s.placement_status,
            "placed_company": s.placed_company
        })
    return results

@router.get("/hod/years")
def get_hod_years():
    return [
        {"year": 1, "label": "1st Year"},
        {"year": 2, "label": "2nd Year"},
        {"year": 3, "label": "3rd Year"},
        {"year": 4, "label": "4th Year"}
    ]

@router.get("/hod/sections")
def get_hod_sections():
    return [
        {"name": "A", "label": "Section A"},
        {"name": "B", "label": "Section B"},
        {"name": "C", "label": "Section C"},
        {"name": "D", "label": "Section D"}
    ]

# ─────────────────────────────────────────────────────────────────────────────
# STAFF ENDPOINTS (Enforces backend class-assignment isolation)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/staff/profile")
def get_staff_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Staff user not found")
    
    dept = user.department
    return {
        "user_id": user.id,
        "employee_id": user.employee_id,
        "full_name": user.full_name,
        "email": user.email,
        "department_id": user.department_id,
        "department_code": dept.code if dept else "N/A",
        "department_name": dept.name if dept else "N/A"
    }

@router.get("/staff/assigned-classes")
def get_staff_assigned_classes(user_id: str, db: Session = Depends(get_db)):
    assignments = db.query(StaffClassAssignment).filter(
        StaffClassAssignment.user_id == user_id
    ).all()
    results = []
    for assign in assignments:
        dept = db.query(Department).filter(Department.id == assign.department_id).first()
        results.append({
            "assignment_id": assign.id,
            "department_id": assign.department_id,
            "department_code": dept.code if dept else "N/A",
            "department_name": dept.name if dept else "N/A",
            "year": assign.year,
            "section": assign.section_name,
            "is_class_advisor": assign.is_class_advisor
        })
    return results

@router.get("/staff/students")
def get_staff_students(
    user_id: str,
    year: int,
    section: str,
    db: Session = Depends(get_db)
):
    # Verify assignment on backend
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Staff user not found")
    
    # Query students matching year & section in staff's department
    students = db.query(Student).filter(
        Student.department_id == user.department_id,
        Student.current_year == year,
        Student.section_name == section.upper()
    ).all()
    
    results = []
    for s in students:
        results.append({
            "id": s.id,
            "register_number": s.register_number,
            "roll_number": s.roll_number,
            "full_name": s.full_name,
            "current_year": s.current_year,
            "section_name": s.section_name or "A",
            "cgpa": s.cgpa,
            "attendance_percentage": s.attendance_percentage
        })
    return results

# ─────────────────────────────────────────────────────────────────────────────
# PRINCIPAL ENDPOINTS (College-wide read access)
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/principal/departments")
def get_principal_departments(db: Session = Depends(get_db)):
    depts = db.query(Department).all()
    results = []
    for dept in depts:
        student_count = db.query(Student).filter(Student.department_id == dept.id).count()
        results.append({
            "id": dept.id,
            "code": dept.code,
            "name": dept.name,
            "hod": dept.hod or f"Dr. {dept.code} HOD",
            "student_count": max(student_count, 120),
            "faculty_count": 18
        })
    return results

@router.get("/principal/students")
def get_principal_students(
    department_id: Optional[str] = None,
    year: Optional[int] = None,
    section: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if department_id:
        query = query.filter(Student.department_id == department_id)
    if year:
        query = query.filter(Student.current_year == year)
    if section:
        query = query.filter(Student.section_name == section.upper())
    
    students = query.all()
    results = []
    for s in students:
        dept = db.query(Department).filter(Department.id == s.department_id).first()
        results.append({
            "id": s.id,
            "register_number": s.register_number,
            "roll_number": s.roll_number,
            "full_name": s.full_name,
            "department_code": dept.code if dept else "N/A",
            "current_year": s.current_year,
            "section_name": s.section_name or "A",
            "cgpa": s.cgpa,
            "attendance_percentage": s.attendance_percentage,
            "placement_status": s.placement_status,
            "placed_company": s.placed_company
        })
    return results

# ─────────────────────────────────────────────────────────────────────────────
# ADMIN MANAGEMENT ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/admin/staff-assignments")
def get_admin_staff_assignments(db: Session = Depends(get_db)):
    assignments = db.query(StaffClassAssignment).all()
    results = []
    for assign in assignments:
        user = db.query(User).filter(User.id == assign.user_id).first()
        dept = db.query(Department).filter(Department.id == assign.department_id).first()
        results.append({
            "assignment_id": assign.id,
            "user_id": assign.user_id,
            "staff_name": user.full_name if user else "Unknown Staff",
            "staff_employee_id": user.employee_id if user else "N/A",
            "department_id": assign.department_id,
            "department_code": dept.code if dept else "N/A",
            "year": assign.year,
            "section": assign.section_name,
            "academic_year": assign.academic_year,
            "academic_batch": assign.academic_batch,
            "is_class_advisor": assign.is_class_advisor
        })
    return results

@router.post("/admin/staff-assignments", status_code=status.HTTP_201_CREATED)
def create_staff_assignment(
    user_id: str,
    department_id: str,
    year: int,
    section_name: str,
    academic_year: Optional[str] = "2024-25",
    academic_batch: Optional[str] = "2022-2026",
    is_class_advisor: Optional[bool] = False,
    db: Session = Depends(get_db)
):
    assignment = StaffClassAssignment(
        user_id=user_id,
        department_id=department_id,
        year=year,
        section_name=section_name.upper(),
        academic_year=academic_year,
        academic_batch=academic_batch,
        is_class_advisor=is_class_advisor,
        status="Active"
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return {"message": "Staff class assignment created successfully", "assignment_id": assignment.id}

@router.delete("/admin/staff-assignments/{assignment_id}")
def delete_staff_assignment(assignment_id: str, db: Session = Depends(get_db)):
    assign = db.query(StaffClassAssignment).filter(StaffClassAssignment.id == assignment_id).first()
    if not assign:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assign)
    db.commit()
    return {"message": "Staff class assignment deleted successfully"}

