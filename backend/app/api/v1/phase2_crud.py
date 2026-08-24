from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.models.models import (
    User, Student, FaceRecognition, Subject, InternalMark, AssignmentMark,
    SemesterMark, SGPARecord, CGPARecord, Fee, Hostel, Bus, Placement, Document, Notification
)
from app.services.academic_calculator import (
    calculate_internal_average, calculate_assignment_average, calculate_sgpa, calculate_cgpa
)

router = APIRouter(prefix="/phase2", tags=["Phase 2 Real Database CRUD APIs"])

# --- STAFF MANAGEMENT SCHEMAS & ENDPOINTS ---
class StaffCreateSchema(BaseModel):
    employee_id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    designation: Optional[str] = "Assistant Professor"
    department_id: Optional[str] = None
    role_id: str
    password: str

@router.post("/staff", status_code=status.HTTP_201_CREATED)
def create_staff_member(payload: StaffCreateSchema, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Staff account with this email already exists!")
    
    user = User(
        employee_id=payload.employee_id,
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        designation=payload.designation,
        department_id=payload.department_id,
        role_id=payload.role_id,
        password_hash=payload.password
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Staff account created successfully!", "staff_id": user.id, "employee_id": user.employee_id}

@router.get("/staff")
def list_staff_members(db: Session = Depends(get_db)):
    staff_list = db.query(User).all()
    return [{"id": s.id, "employee_id": s.employee_id, "full_name": s.full_name, "email": s.email, "designation": s.designation} for s in staff_list]

# --- FACE RECOGNITION EMBEDDING ENDPOINT ---
class FaceEmbeddingSchema(BaseModel):
    student_id: str
    encrypted_face_embedding: str

@router.post("/face-embedding")
def store_face_embedding(payload: FaceEmbeddingSchema, db: Session = Depends(get_db)):
    existing = db.query(FaceRecognition).filter(FaceRecognition.student_id == payload.student_id).first()
    if existing:
        existing.encrypted_face_embedding = payload.encrypted_face_embedding
        db.commit()
        return {"message": "Face embedding vector updated successfully!", "student_id": payload.student_id}

    rec = FaceRecognition(student_id=payload.student_id, encrypted_face_embedding=payload.encrypted_face_embedding)
    db.add(rec)
    db.commit()
    return {"message": "Face embedding vector saved successfully!", "student_id": payload.student_id}

# --- MARKS ENTRY WITH AUTOMATIC CALCULATION ---
class InternalMarkSchema(BaseModel):
    student_id: str
    subject_id: str
    internal_1: float
    internal_2: float
    internal_3: float

@router.post("/marks/internal")
def save_internal_marks(payload: InternalMarkSchema, db: Session = Depends(get_db)):
    avg = calculate_internal_average(payload.internal_1, payload.internal_2, payload.internal_3)
    
    rec = db.query(InternalMark).filter(
        InternalMark.student_id == payload.student_id,
        InternalMark.subject_id == payload.subject_id
    ).first()

    if not rec:
        rec = InternalMark(
            student_id=payload.student_id,
            subject_id=payload.subject_id,
            internal_1=payload.internal_1,
            internal_2=payload.internal_2,
            internal_3=payload.internal_3,
            average=avg
        )
        db.add(rec)
    else:
        rec.internal_1 = payload.internal_1
        rec.internal_2 = payload.internal_2
        rec.internal_3 = payload.internal_3
        rec.average = avg

    db.commit()
    return {"message": "Internal marks saved with automatic average calculation!", "average": avg}

# --- SEMESTER MARKS & AUDIT TRAIL ENDPOINT ---
class SemesterMarkSchema(BaseModel):
    student_id: str
    semester: int
    subject_code: str
    subject_name: Optional[str] = None
    credits: float = 3.0
    internal_mark: float = 45.0
    semester_exam_mark: float = 85.0
    total_mark: float = 90.0
    grade: str = "O"
    grade_point: float = 10.0
    result: str = "Pass"
    updated_by: Optional[str] = "ADMIN001"
    reason_for_change: str

@router.post("/marks/semester")
def update_semester_mark(payload: SemesterMarkSchema, db: Session = Depends(get_db)):
    """
    Updates semester mark, enforces future semester lock, recalculates SGPA/CGPA, and creates audit log.
    """
    st = db.query(Student).filter((Student.id == payload.student_id) | (Student.register_number == payload.student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found!")

    # Lock Future Semesters
    if payload.semester > (st.current_semester or 6):
        raise HTTPException(
            status_code=400,
            detail=f"Future Semester Locked: Student is currently in Semester {st.current_semester or 6}. Marks for Semester {payload.semester} are 'Not Yet Completed'."
        )

    if not payload.reason_for_change.strip():
        raise HTTPException(status_code=400, detail="Audit Policy: Reason for change is mandatory for mark updates!")

    rec = db.query(SemesterMark).filter(
        SemesterMark.student_id == st.id,
        SemesterMark.semester == payload.semester,
        SemesterMark.subject_code == payload.subject_code
    ).first()

    old_grade = rec.grade if rec else "N/A"

    if not rec:
        rec = SemesterMark(
            student_id=st.id,
            semester=payload.semester,
            subject_code=payload.subject_code,
            subject_name=payload.subject_name or payload.subject_code,
            credits=payload.credits,
            internal_mark=payload.internal_mark,
            semester_exam_mark=payload.semester_exam_mark,
            total_mark=payload.total_mark,
            grade=payload.grade,
            grade_point=payload.grade_point,
            result=payload.result
        )
        db.add(rec)
    else:
        rec.internal_mark = payload.internal_mark
        rec.semester_exam_mark = payload.semester_exam_mark
        rec.total_mark = payload.total_mark
        rec.grade = payload.grade
        rec.grade_point = payload.grade_point
        rec.result = payload.result

    # Recalculate SGPA & CGPA across completed semesters only
    all_completed = db.query(SemesterMark).filter(
        SemesterMark.student_id == st.id,
        SemesterMark.semester <= st.current_semester
    ).all()

    st.sgpa = calculate_sgpa([m for m in all_completed if m.semester == payload.semester] or [rec])
    st.cgpa = calculate_cgpa(all_completed)

    # Log Audit Event
    from app.services.audit_service import log_audit_event
    log_audit_event(
        db,
        user_id=payload.updated_by or "ADMIN001",
        action="UPDATE_ACADEMIC_MARK",
        entity_type="SemesterMark",
        entity_id=st.id,
        details=f"Updated Sem {payload.semester} {payload.subject_code} for {st.full_name}. Grade: {old_grade} -> {payload.grade}. Reason: {payload.reason_for_change}"
    )

    db.commit()

    return {
        "message": f"🎉 Success! Semester {payload.semester} mark updated for {st.full_name}. Recalculated SGPA: {st.sgpa}, CGPA: {st.cgpa}.",
        "student_id": st.id,
        "sgpa": st.sgpa,
        "cgpa": st.cgpa,
        "grade": payload.grade
    }

# --- NOTIFICATIONS ENDPOINT ---
class NotificationSchema(BaseModel):
    title: str
    message: str
    target_role: Optional[str] = "ALL"

@router.post("/notifications")
def create_notification(payload: NotificationSchema, db: Session = Depends(get_db)):
    notif = Notification(title=payload.title, message=payload.message, target_role=payload.target_role)
    db.add(notif)
    db.commit()
    return {"message": "Notification broadcasted successfully!", "title": notif.title}


# --- 18-CATEGORY GRANULAR STUDENT UPDATE ENDPOINT ---
from app.models.models import StudentClassHistory, CertificateItem, AuditLog
from app.services.audit_service import log_audit_event

class CategoryUpdateSchema(BaseModel):
    category: str  # personal, contact, address, family, academic, attendance, internal_marks, assignment_marks, semester_marks, certificates, documents, placement, fees, hostel, bus, scholarship, face_recognition, other
    updated_by: Optional[str] = "AIDS001"
    reason: Optional[str] = "Staff administrative record update"
    data: dict

@router.put("/students/{student_id}/category-update")
def update_student_category(student_id: str, payload: CategoryUpdateSchema, db: Session = Depends(get_db)):
    """
    Granular 18-Category Student Record Update Endpoint.
    Enforces class promotion history logging, audit trail records, and dynamic recalculations.
    """
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student digital profile not found")

    cat = payload.category.lower().strip()
    data = payload.data or {}

    old_values = {}
    new_values = {}

    if cat == "personal":
        if "full_name" in data and data["full_name"]:
            old_values["full_name"] = st.full_name
            st.full_name = data["full_name"]
            new_values["full_name"] = st.full_name
        if "dob" in data and data["dob"]:
            st.dob = data["dob"]
        if "gender" in data and data["gender"]:
            st.gender = data["gender"]
        if "blood_group" in data and data["blood_group"]:
            st.blood_group = data["blood_group"]
        if "nationality" in data and data["nationality"]:
            st.nationality = data["nationality"]
        if "religion" in data and data["religion"]:
            st.religion = data["religion"]
        if "community" in data and data["community"]:
            st.community = data["community"]
        if "caste" in data and data["caste"]:
            st.caste = data["caste"]

    elif cat in ["contact", "address"]:
        if "phone" in data and data["phone"]:
            st.phone = data["phone"]
        if "email" in data and data["email"]:
            st.email = data["email"]
        if "address_line" in data and data["address_line"]:
            st.address_line = data["address_line"]
        if "city" in data and data["city"]:
            st.city = data["city"]
        if "district" in data and data["district"]:
            st.district = data["district"]
        if "state" in data and data["state"]:
            st.state = data["state"]
        if "pincode" in data and data["pincode"]:
            st.pincode = data["pincode"]

    elif cat == "family":
        if "father_name" in data and data["father_name"]:
            st.father_name = data["father_name"]
        if "mother_name" in data and data["mother_name"]:
            st.mother_name = data["mother_name"]
        if "guardian_name" in data and data["guardian_name"]:
            st.guardian_name = data["guardian_name"]
        if "parent_phone" in data and data["parent_phone"]:
            st.parent_phone = data["parent_phone"]
        if "emergency_contact" in data and data["emergency_contact"]:
            st.emergency_contact = data["emergency_contact"]

    elif cat == "academic":
        # Check if Year or Section changed to record History
        new_year = data.get("current_year")
        new_sec = data.get("section_name")
        if (new_year and int(new_year) != st.current_year) or (new_sec and new_sec != st.section_name):
            history = StudentClassHistory(
                student_id=st.id,
                from_year=st.current_year,
                to_year=int(new_year) if new_year else st.current_year,
                from_section=st.section_name or "A",
                to_section=new_sec or st.section_name or "A",
                changed_by=payload.updated_by,
                reason=payload.reason or "Academic Promotion / Section Transfer"
            )
            db.add(history)

            if new_year:
                st.current_year = int(new_year)
                st.current_semester = int(new_year) * 2
            if new_sec:
                st.section_name = new_sec

        if "mentor" in data and data["mentor"]:
            st.mentor = data["mentor"]
        if "class_advisor" in data and data["class_advisor"]:
            st.class_advisor = data["class_advisor"]
        if "status" in data and data["status"]:
            st.status = data["status"]

    elif cat == "fees":
        fee_rec = db.query(Fee).filter(Fee.student_id == st.id).first()
        if not fee_rec:
            fee_rec = Fee(student_id=st.id)
            db.add(fee_rec)
        if "tuition_fee" in data: fee_rec.tuition_fee = float(data["tuition_fee"])
        if "paid_amount" in data: fee_rec.paid_amount = float(data["paid_amount"])
        if "balance" in data: fee_rec.balance = float(data["balance"])

    elif cat == "hostel":
        st.hosteller = True
        st.hostel_details = f"{data.get('hostel_name', 'VSB Hostel')}, Block {data.get('block', 'A')}, Room {data.get('room_number', '204')}"

    elif cat == "bus":
        st.day_scholar = True
        st.bus_route = f"{data.get('bus_number', 'Route 4')}: {data.get('route', 'Karur')}"

    elif cat == "placement":
        if "placement_status" in data and data["placement_status"]:
            st.placement_status = data["placement_status"]
        if "placed_company" in data and data["placed_company"]:
            st.placed_company = data["placed_company"]
        if "package_offered" in data and data["package_offered"]:
            st.package_offered = data["package_offered"]

    # Audit Trail Entry
    log_audit_event(
        db,
        user_id=payload.updated_by or "AIDS001",
        action=f"UPDATE_STUDENT_{cat.upper()}",
        entity_type="Student",
        entity_id=st.id,
        details=f"Updated category '{cat}' for {st.full_name} ({st.register_number}). Reason: {payload.reason}"
    )

    db.commit()
    db.refresh(st)

    return {
        "message": f"🎉 Successfully updated {cat.upper()} category for {st.full_name}!",
        "student_id": st.id,
        "category": cat
    }


# --- ADD CERTIFICATE ENDPOINT ---
class CertificateCreateSchema(BaseModel):
    student_id: str
    name: str
    type: str  # Hackathon, Workshop, Internship, Sports, NSS, NCC, Course, Academic
    issued_by: Optional[str] = None
    issue_date: Optional[str] = None
    certificate_number: Optional[str] = None
    achievement: Optional[str] = None
    participation_status: Optional[str] = "Participation"
    position: Optional[str] = None
    file_path: Optional[str] = None
    notes: Optional[str] = None
    updated_by: Optional[str] = "AIDS001"

@router.post("/certificates", status_code=status.HTTP_201_CREATED)
def add_student_certificate(payload: CertificateCreateSchema, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == payload.student_id) | (Student.register_number == payload.student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student digital profile not found")

    cert = CertificateItem(
        student_id=st.id,
        name=payload.name,
        type=payload.type,
        issued_by=payload.issued_by,
        issue_date=payload.issue_date,
        certificate_number=payload.certificate_number,
        achievement=payload.achievement,
        participation_status=payload.participation_status,
        position=payload.position,
        file_path=payload.file_path,
        notes=payload.notes
    )
    db.add(cert)

    log_audit_event(
        db,
        user_id=payload.updated_by or "AIDS001",
        action="ADD_STUDENT_CERTIFICATE",
        entity_type="CertificateItem",
        entity_id=st.id,
        details=f"Added {payload.type} Certificate '{payload.name}' for {st.full_name} ({st.register_number})"
    )

    db.commit()
    return {"message": f"🎉 Certificate '{payload.name}' successfully added for {st.full_name}!", "certificate_id": cert.id}


