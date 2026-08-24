"""
Campus360 AI — Student Self-Service Portal API
Routes accessible only by logged-in students (and parent view of their ward)
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    Student, Attendance, InternalMark, AssignmentMark,
    SemesterMark, SGPARecord, CGPARecord, Fee, Placement,
    Document, Notification, LeaveRequest, ODRequest, LabMark, ModelExamMark
)
from app.schemas.schemas import (
    LeaveRequestCreate, LeaveRequestResponse,
    ODRequestCreate, ODRequestResponse
)
from datetime import datetime, timezone

router = APIRouter(prefix="/student-portal", tags=["Student Portal"])


def get_student_or_404(register_number: str, db: Session) -> Student:
    student = db.query(Student).filter(
        Student.register_number == register_number
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail=f"Student {register_number} not found")
    return student


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/dashboard/{register_number}")
def student_dashboard(register_number: str, db: Session = Depends(get_db)):
    student = get_student_or_404(register_number, db)
    dept = student.department
    prog = student.program

    # Count attendance
    att_records = db.query(Attendance).filter(Attendance.student_id == student.id).all()
    total_classes = len(att_records)
    present_count = sum(1 for a in att_records if a.present)
    absent_count = sum(1 for a in att_records if a.absent)
    od_count = sum(1 for a in att_records if a.od)

    # Count pending requests
    pending_leaves = db.query(LeaveRequest).filter(
        LeaveRequest.student_id == student.id,
        LeaveRequest.status == "Pending"
    ).count()
    pending_od = db.query(ODRequest).filter(
        ODRequest.student_id == student.id,
        ODRequest.status == "Pending"
    ).count()

    # Fee status
    fee = student.fee_record
    placement = student.placement_record

    # SGPA by semester
    sgpa_records = db.query(SGPARecord).filter(SGPARecord.student_id == student.id).all()

    return {
        "student": {
            "id": student.id,
            "register_number": student.register_number,
            "roll_number": student.roll_number,
            "admission_number": student.admission_number,
            "full_name": student.full_name,
            "photo_url": student.photo_url,
            "dob": student.dob,
            "gender": student.gender,
            "blood_group": student.blood_group,
            "email": student.email,
            "phone": student.phone,
            "department": dept.name if dept else "N/A",
            "department_code": dept.code if dept else "N/A",
            "program": prog.name if prog else "N/A",
            "batch": student.batch,
            "current_year": student.current_year,
            "current_semester": student.current_semester,
            "mentor": student.mentor,
            "class_advisor": student.class_advisor,
            "counsellor": student.counsellor,
            "academic_year": student.academic_year,
            "hosteller": student.hosteller,
            "bus_route": student.bus_route,
            "scholarship": student.scholarship,
            "nationality": student.nationality,
            "religion": student.religion,
            "community": student.community,
            "status": student.status,
        },
        "academics": {
            "cgpa": student.cgpa,
            "sgpa": student.sgpa,
            "department_rank": student.department_rank,
            "arrears_count": student.arrears_count,
            "credits_earned": student.credits_earned,
            "sgpa_progression": [{"semester": s.semester, "sgpa": s.sgpa} for s in sorted(sgpa_records, key=lambda x: x.semester)]
        },
        "attendance": {
            "overall_percentage": student.attendance_percentage,
            "total_classes": total_classes,
            "present": present_count,
            "absent": absent_count,
            "od": od_count,
        },
        "placement": {
            "status": student.placement_status,
            "company": student.placed_company,
            "package": student.package_offered,
            "score": placement.assessment_score if placement else None,
        },
        "fee": {
            "status": fee.payment_status if fee else "N/A",
            "balance": fee.balance if fee else 0.0,
        },
        "requests": {
            "pending_leaves": pending_leaves,
            "pending_od": pending_od,
        },
        "parent": {
            "father_name": student.father_name,
            "mother_name": student.mother_name,
            "guardian_name": student.guardian_name,
            "parent_phone": student.parent_phone,
            "parent_email": student.parent_email,
        }
    }


# ─────────────────────────────────────────────────────────────────────────────
# ATTENDANCE DETAILS
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/attendance/{register_number}")
def student_attendance(register_number: str, db: Session = Depends(get_db)):
    student = get_student_or_404(register_number, db)
    records = db.query(Attendance).filter(Attendance.student_id == student.id).all()

    # Group by subject
    by_subject: dict = {}
    daily: list = []

    for r in records:
        daily.append({
            "date": r.date,
            "hour": r.hour,
            "status": r.attendance_status,
            "present": r.present,
            "absent": r.absent,
            "od": r.od,
            "medical_leave": r.medical_leave,
            "late_entry": r.late_entry,
        })

    total = len(records)
    present = sum(1 for r in records if r.present)

    return {
        "overall_percentage": round((present / total * 100) if total > 0 else student.attendance_percentage, 2),
        "total_classes": total,
        "present_days": present,
        "absent_days": sum(1 for r in records if r.absent),
        "od_days": sum(1 for r in records if r.od),
        "medical_leave_days": sum(1 for r in records if r.medical_leave),
        "late_entries": sum(1 for r in records if r.late_entry),
        "daily_records": sorted(daily, key=lambda x: x["date"], reverse=True)[:60],
        "shortage_risk": (present / total * 100 if total > 0 else 100) < 75,
    }


# ─────────────────────────────────────────────────────────────────────────────
# MARKS — ALL CATEGORIES
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/marks/{register_number}")
def student_marks(register_number: str, db: Session = Depends(get_db)):
    student = get_student_or_404(register_number, db)

    internal = db.query(InternalMark).filter(InternalMark.student_id == student.id).all()
    assignment = db.query(AssignmentMark).filter(AssignmentMark.student_id == student.id).all()
    semester = db.query(SemesterMark).filter(SemesterMark.student_id == student.id).all()
    lab = db.query(LabMark).filter(LabMark.student_id == student.id).all()
    model_exam = db.query(ModelExamMark).filter(ModelExamMark.student_id == student.id).all()
    sgpa_recs = db.query(SGPARecord).filter(SGPARecord.student_id == student.id).all()
    cgpa_recs = db.query(CGPARecord).filter(CGPARecord.student_id == student.id).all()

    return {
        "cgpa": student.cgpa,
        "sgpa": student.sgpa,
        "department_rank": student.department_rank,
        "arrears": student.arrears_count,
        "credits_earned": student.credits_earned,
        "internal_marks": [
            {
                "subject_id": m.subject_id,
                "ia1": m.internal_1,
                "ia2": m.internal_2,
                "ia3": m.internal_3,
                "average": m.average
            } for m in internal
        ],
        "assignment_marks": [
            {
                "subject_id": m.subject_id,
                "a1": m.assignment_1,
                "a2": m.assignment_2,
                "average": m.average
            } for m in assignment
        ],
        "lab_marks": [
            {
                "semester": m.semester,
                "lab_name": m.lab_name,
                "cycle_test_1": m.cycle_test_1,
                "cycle_test_2": m.cycle_test_2,
                "viva": m.viva,
                "record": m.record,
                "total": m.total,
                "max_marks": m.max_marks
            } for m in lab
        ],
        "model_exam_marks": [
            {
                "semester": m.semester,
                "subject_name": m.subject_name,
                "marks": m.marks_obtained,
                "max_marks": m.max_marks,
                "grade": m.grade
            } for m in model_exam
        ],
        "semester_marks": [
            {
                "semester": m.semester,
                "subject_id": m.subject_id,
                "marks": m.marks,
                "grade": m.grade,
                "credits": m.credits,
                "result": m.result
            } for m in semester
        ],
        "sgpa_records": [
            {"semester": s.semester, "sgpa": s.sgpa}
            for s in sorted(sgpa_recs, key=lambda x: x.semester)
        ],
        "cgpa_records": [{"cgpa": c.cgpa} for c in cgpa_recs],
    }


# ─────────────────────────────────────────────────────────────────────────────
# PLACEMENT PROFILE
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/placement/{register_number}")
def student_placement(register_number: str, db: Session = Depends(get_db)):
    student = get_student_or_404(register_number, db)
    placement = student.placement_record

    return {
        "placement_status": student.placement_status,
        "placed_company": student.placed_company,
        "package_offered": student.package_offered,
        "skills": placement.skills if placement else None,
        "programming_languages": placement.programming_languages if placement else None,
        "internships": placement.internships if placement else None,
        "hackathons": placement.hackathons if placement else None,
        "assessment_score": placement.assessment_score if placement else None,
        "communication_score": placement.communication_score if placement else None,
        "technical_score": placement.technical_score if placement else None,
        "resume": placement.resume if placement else None,
    }


# ─────────────────────────────────────────────────────────────────────────────
# FEE STATUS
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/fee/{register_number}")
def student_fee(register_number: str, db: Session = Depends(get_db)):
    student = get_student_or_404(register_number, db)
    fee = student.fee_record
    if not fee:
        return {"status": "No fee record found", "balance": 0}

    return {
        "admission_fee": fee.admission_fee,
        "tuition_fee": fee.tuition_fee,
        "exam_fee": fee.exam_fee,
        "bus_fee": fee.bus_fee,
        "hostel_fee": fee.hostel_fee,
        "scholarship": fee.scholarship,
        "balance": fee.balance,
        "payment_status": fee.payment_status,
        "total_fee": fee.admission_fee + fee.tuition_fee + fee.exam_fee + fee.bus_fee + fee.hostel_fee,
        "net_payable": max(0, (fee.admission_fee + fee.tuition_fee + fee.exam_fee) - fee.scholarship),
    }


# ─────────────────────────────────────────────────────────────────────────────
# DOCUMENTS
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/documents/{register_number}")
def student_documents(register_number: str, db: Session = Depends(get_db)):
    student = get_student_or_404(register_number, db)
    doc = student.document_record

    if not doc:
        return {"documents": [], "message": "No documents uploaded yet"}

    documents = []
    doc_fields = {
        "10th Marksheet": doc.mark_10th,
        "12th Marksheet": doc.mark_12th,
        "Transfer Certificate": doc.transfer_certificate,
        "Community Certificate": doc.community_certificate,
        "Income Certificate": doc.income_certificate,
        "Bonafide Certificate": doc.bonafide,
        "Birth Certificate": doc.birth_certificate,
        "Medical Certificate": doc.medical_certificate,
        "Internship Certificates": doc.internship_certificates,
        "Hackathon Certificates": doc.hackathon_certificates,
        "Other Certificates": doc.other_certificates,
    }
    for doc_name, file_path in doc_fields.items():
        if file_path:
            documents.append({
                "name": doc_name,
                "file_path": file_path,
                "uploaded_date": doc.uploaded_date.isoformat() if doc.uploaded_date else None,
                "available": True
            })
        else:
            documents.append({
                "name": doc_name,
                "file_path": None,
                "available": False
            })

    return {"documents": documents, "uploaded_date": doc.uploaded_date.isoformat() if doc.uploaded_date else None}


# ─────────────────────────────────────────────────────────────────────────────
# NOTIFICATIONS
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/notifications/{register_number}")
def student_notifications(register_number: str, db: Session = Depends(get_db)):
    student = get_student_or_404(register_number, db)
    notifications = db.query(Notification).filter(
        Notification.target_role.in_(["ALL", "STUDENT"])
    ).order_by(Notification.created_at.desc()).limit(20).all()

    return {
        "notifications": [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "created_at": n.created_at.isoformat()
            }
            for n in notifications
        ]
    }


# ─────────────────────────────────────────────────────────────────────────────
# LEAVE REQUEST
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/leave-request", response_model=LeaveRequestResponse)
def submit_leave_request(payload: LeaveRequestCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    leave = LeaveRequest(
        student_id=payload.student_id,
        from_date=payload.from_date,
        to_date=payload.to_date,
        reason=payload.reason,
        leave_type=payload.leave_type or "Medical",
        status="Pending"
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave

@router.get("/leave-requests/{register_number}", response_model=List[LeaveRequestResponse])
def get_leave_requests(register_number: str, db: Session = Depends(get_db)):
    student = get_student_or_404(register_number, db)
    return db.query(LeaveRequest).filter(
        LeaveRequest.student_id == student.id
    ).order_by(LeaveRequest.created_at.desc()).all()


# ─────────────────────────────────────────────────────────────────────────────
# OD REQUEST
# ─────────────────────────────────────────────────────────────────────────────
@router.post("/od-request", response_model=ODRequestResponse)
def submit_od_request(payload: ODRequestCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    od = ODRequest(
        student_id=payload.student_id,
        from_date=payload.from_date,
        to_date=payload.to_date,
        event_name=payload.event_name,
        event_type=payload.event_type or "Symposium",
        venue=payload.venue,
        reason=payload.reason,
        status="Pending"
    )
    db.add(od)
    db.commit()
    db.refresh(od)
    return od

@router.get("/od-requests/{register_number}", response_model=List[ODRequestResponse])
def get_od_requests(register_number: str, db: Session = Depends(get_db)):
    student = get_student_or_404(register_number, db)
    return db.query(ODRequest).filter(
        ODRequest.student_id == student.id
    ).order_by(ODRequest.created_at.desc()).all()


# ─────────────────────────────────────────────────────────────────────────────
# STAFF: APPROVE / REJECT LEAVE OR OD
# ─────────────────────────────────────────────────────────────────────────────
@router.patch("/leave-request/{request_id}/approve")
def approve_leave(request_id: str, approved_by: str, db: Session = Depends(get_db)):
    req = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Leave request not found")
    req.status = "Approved"
    req.approved_by = approved_by
    req.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Leave request approved"}

@router.patch("/leave-request/{request_id}/reject")
def reject_leave(request_id: str, approved_by: str, remarks: Optional[str] = None, db: Session = Depends(get_db)):
    req = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Leave request not found")
    req.status = "Rejected"
    req.approved_by = approved_by
    req.faculty_remarks = remarks
    req.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Leave request rejected"}

@router.patch("/od-request/{request_id}/approve")
def approve_od(request_id: str, approved_by: str, db: Session = Depends(get_db)):
    req = db.query(ODRequest).filter(ODRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="OD request not found")
    req.status = "Approved"
    req.approved_by = approved_by
    req.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "OD request approved"}

@router.patch("/od-request/{request_id}/reject")
def reject_od(request_id: str, approved_by: str, remarks: Optional[str] = None, db: Session = Depends(get_db)):
    req = db.query(ODRequest).filter(ODRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="OD request not found")
    req.status = "Rejected"
    req.approved_by = approved_by
    req.faculty_remarks = remarks
    req.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "OD request rejected"}
