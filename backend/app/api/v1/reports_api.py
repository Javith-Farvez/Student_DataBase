from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Student, Department
from app.services.pdf_service import generate_student_profile_pdf
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/reports", tags=["Printable PDF Reports"])

@router.get("/student/{student_id}/pdf")
def get_student_profile_pdf_report(student_id: str, db: Session = Depends(get_db)):
    """
    Generates printable PDF report with official V.S.B Engineering College logo and header.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_dict = {
        "id": student.id,
        "register_number": student.register_number,
        "roll_number": student.roll_number,
        "admission_number": student.admission_number,
        "full_name": student.full_name,
        "department_name": student.department.name if student.department else "Computer Science Engineering",
        "current_year": student.current_year,
        "current_semester": student.current_semester,
        "batch": student.batch,
        "dob": student.dob,
        "gender": student.gender,
        "blood_group": student.blood_group,
        "phone": student.phone,
        "email": student.email,
        "father_name": student.father_name,
        "mother_name": student.mother_name,
        "hosteller": student.hosteller,
        "bus_route": student.bus_route,
        "scholarship": student.scholarship,
        "cgpa": student.cgpa,
        "sgpa": student.sgpa,
        "credits_earned": student.credits_earned,
        "attendance_percentage": student.attendance_percentage,
        "placement_status": student.placement_status
    }

    pdf_bytes = generate_student_profile_pdf(student_dict)

    log_audit_event(db, user_id="STF001", action="GENERATE_PDF_REPORT", entity_type="Student", entity_id=student.id, details=f"Generated PDF report for student {student.register_number}")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=VSB_Profile_{student.register_number}.pdf"}
    )

@router.get("/audit-logs")
def get_system_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    """
    Returns latest audit log entries recorded in MySQL.
    """
    from app.models.models import AuditLog
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    results = []
    for l in logs:
        results.append({
            "id": l.id,
            "user_id": l.user_id or "SYSTEM",
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "details": l.details,
            "ip_address": l.ip_address or "127.0.0.1",
            "timestamp": l.timestamp.isoformat() if l.timestamp else None
        })
    return {"count": len(results), "logs": results}
