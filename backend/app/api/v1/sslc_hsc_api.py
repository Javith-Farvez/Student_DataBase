from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import SSLCDetail, HSCDetail, Student, Department
from app.schemas.schemas import (
    SSLCCreate, SSLCUpdate, SSLCResponse,
    HSCCreate, HSCUpdate, HSCResponse
)
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/sslc-hsc", tags=["SSLC & HSC Academic Module"])


# ─────────────────────────────────────────────────────────────
#  UTILITY: auto-compute cutoff for HSC
# ─────────────────────────────────────────────────────────────
def compute_hsc_cutoff(physics: Optional[float], chemistry: Optional[float],
                        mathematics: Optional[float], biology: Optional[float],
                        computer_science: Optional[float], bio_cs_subject: str = "Biology") -> Optional[float]:
    """
    Tamil Nadu HSC Cutoff Formula (out of 200):
      Cutoff = Physics/2 + Chemistry/2 + Maths (or Biology/CS)
    """
    if physics is None or chemistry is None:
        return None
    p = (physics or 0) / 2
    c = (chemistry or 0) / 2
    if bio_cs_subject == "Computer Science":
        m = (computer_science or mathematics or 0)
    else:
        m = (mathematics or biology or 0)
    return round(p + c + m, 2)


# ─────────────────────────────────────────────────────────────
#  READ: Get SSLC + HSC for a single student
# ─────────────────────────────────────────────────────────────
@router.get("/student/{student_id}")
def get_student_academic_history(student_id: str, db: Session = Depends(get_db)):
    """
    Returns both SSLC (10th) and HSC (12th) records for a student.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    sslc = db.query(SSLCDetail).filter(SSLCDetail.student_id == student_id).first()
    hsc = db.query(HSCDetail).filter(HSCDetail.student_id == student_id).first()

    return {
        "student_id": student_id,
        "register_number": student.register_number,
        "full_name": student.full_name,
        "sslc": _serialize_sslc(sslc) if sslc else None,
        "hsc": _serialize_hsc(hsc) if hsc else None
    }


# ─────────────────────────────────────────────────────────────
#  READ: List all SSLC records (with filters)
# ─────────────────────────────────────────────────────────────
@router.get("/sslc", response_model=List[dict])
def list_sslc_records(
    board: Optional[str] = None,
    passing_year: Optional[int] = None,
    min_percentage: Optional[float] = None,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """List all SSLC records with optional filters."""
    query = db.query(SSLCDetail)
    if board:
        query = query.filter(SSLCDetail.board.ilike(f"%{board}%"))
    if passing_year:
        query = query.filter(SSLCDetail.passing_year == passing_year)
    if min_percentage:
        query = query.filter(SSLCDetail.percentage >= min_percentage)

    records = query.limit(limit).all()
    return [_serialize_sslc(r) for r in records]


# ─────────────────────────────────────────────────────────────
#  READ: List all HSC records (with filters)
# ─────────────────────────────────────────────────────────────
@router.get("/hsc", response_model=List[dict])
def list_hsc_records(
    board: Optional[str] = None,
    passing_year: Optional[int] = None,
    stream: Optional[str] = None,
    min_percentage: Optional[float] = None,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """List all HSC records with optional filters."""
    query = db.query(HSCDetail)
    if board:
        query = query.filter(HSCDetail.board.ilike(f"%{board}%"))
    if passing_year:
        query = query.filter(HSCDetail.passing_year == passing_year)
    if stream:
        query = query.filter(HSCDetail.stream.ilike(f"%{stream}%"))
    if min_percentage:
        query = query.filter(HSCDetail.percentage >= min_percentage)

    records = query.limit(limit).all()
    return [_serialize_hsc(r) for r in records]


# ─────────────────────────────────────────────────────────────
#  CREATE: SSLC record
# ─────────────────────────────────────────────────────────────
@router.post("/sslc", status_code=201)
def create_sslc_record(payload: SSLCCreate, db: Session = Depends(get_db)):
    """Create a new SSLC (10th) record for a student."""
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    existing = db.query(SSLCDetail).filter(SSLCDetail.student_id == payload.student_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="SSLC record already exists for this student. Use PUT to update.")

    # Auto-compute percentage if not provided
    percentage = payload.percentage
    if percentage is None and payload.total_marks and payload.max_marks:
        percentage = round((payload.total_marks / payload.max_marks) * 100, 2)

    record = SSLCDetail(
        student_id=payload.student_id,
        school_name=payload.school_name,
        board=payload.board,
        passing_year=payload.passing_year,
        register_number=payload.register_number,
        total_marks=payload.total_marks,
        max_marks=payload.max_marks or 500.0,
        percentage=percentage,
        tamil=payload.tamil,
        english=payload.english,
        mathematics=payload.mathematics,
        science=payload.science,
        social_science=payload.social_science,
        optional_subject=payload.optional_subject,
        optional_marks=payload.optional_marks,
        remarks=payload.remarks,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    log_audit_event(db, user_id="SYSTEM", action="CREATE_SSLC", entity_type="SSLCDetail",
                    entity_id=record.id, details=f"Created SSLC record for student {student.register_number}")

    return {"message": "SSLC record created successfully", "id": record.id, "data": _serialize_sslc(record)}


# ─────────────────────────────────────────────────────────────
#  CREATE: HSC record
# ─────────────────────────────────────────────────────────────
@router.post("/hsc", status_code=201)
def create_hsc_record(payload: HSCCreate, db: Session = Depends(get_db)):
    """Create a new HSC (12th) record for a student."""
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    existing = db.query(HSCDetail).filter(HSCDetail.student_id == payload.student_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="HSC record already exists for this student. Use PUT to update.")

    # Auto-compute percentage if not provided
    percentage = payload.percentage
    if percentage is None and payload.total_marks and payload.max_marks:
        percentage = round((payload.total_marks / payload.max_marks) * 100, 2)

    # Auto-compute cutoff if not provided
    cutoff = payload.cutoff
    if cutoff is None:
        cutoff = compute_hsc_cutoff(
            payload.physics, payload.chemistry, payload.mathematics,
            payload.biology, payload.computer_science, payload.bio_cs_subject or "Biology"
        )

    record = HSCDetail(
        student_id=payload.student_id,
        school_name=payload.school_name,
        board=payload.board,
        passing_year=payload.passing_year,
        register_number=payload.register_number,
        stream=payload.stream or "Science",
        total_marks=payload.total_marks,
        max_marks=payload.max_marks or 600.0,
        percentage=percentage,
        cutoff=cutoff,
        physics=payload.physics,
        chemistry=payload.chemistry,
        mathematics=payload.mathematics,
        biology=payload.biology,
        computer_science=payload.computer_science,
        language1=payload.language1,
        language2=payload.language2,
        bio_cs_subject=payload.bio_cs_subject or "Biology",
        remarks=payload.remarks,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    log_audit_event(db, user_id="SYSTEM", action="CREATE_HSC", entity_type="HSCDetail",
                    entity_id=record.id, details=f"Created HSC record for student {student.register_number}")

    return {"message": "HSC record created successfully", "id": record.id, "data": _serialize_hsc(record)}


# ─────────────────────────────────────────────────────────────
#  UPDATE: SSLC record
# ─────────────────────────────────────────────────────────────
@router.put("/sslc/{record_id}")
def update_sslc_record(record_id: str, payload: SSLCUpdate, db: Session = Depends(get_db)):
    """Update an existing SSLC record."""
    record = db.query(SSLCDetail).filter(SSLCDetail.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="SSLC record not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Recompute percentage if marks changed
    total = update_data.get("total_marks", record.total_marks)
    maximum = update_data.get("max_marks", record.max_marks) or 500.0
    if total and maximum and "percentage" not in update_data:
        update_data["percentage"] = round((total / maximum) * 100, 2)

    for key, value in update_data.items():
        setattr(record, key, value)

    db.commit()
    db.refresh(record)

    log_audit_event(db, user_id="SYSTEM", action="UPDATE_SSLC", entity_type="SSLCDetail",
                    entity_id=record.id, details=f"Updated SSLC record {record_id}")

    return {"message": "SSLC record updated successfully", "data": _serialize_sslc(record)}


# ─────────────────────────────────────────────────────────────
#  UPDATE: HSC record
# ─────────────────────────────────────────────────────────────
@router.put("/hsc/{record_id}")
def update_hsc_record(record_id: str, payload: HSCUpdate, db: Session = Depends(get_db)):
    """Update an existing HSC record."""
    record = db.query(HSCDetail).filter(HSCDetail.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="HSC record not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Recompute percentage
    total = update_data.get("total_marks", record.total_marks)
    maximum = update_data.get("max_marks", record.max_marks) or 600.0
    if total and maximum and "percentage" not in update_data:
        update_data["percentage"] = round((total / maximum) * 100, 2)

    # Recompute cutoff
    if "cutoff" not in update_data:
        physics = update_data.get("physics", record.physics)
        chemistry = update_data.get("chemistry", record.chemistry)
        mathematics = update_data.get("mathematics", record.mathematics)
        biology = update_data.get("biology", record.biology)
        computer_science = update_data.get("computer_science", record.computer_science)
        bio_cs_subject = update_data.get("bio_cs_subject", record.bio_cs_subject) or "Biology"
        computed = compute_hsc_cutoff(physics, chemistry, mathematics, biology, computer_science, bio_cs_subject)
        if computed is not None:
            update_data["cutoff"] = computed

    for key, value in update_data.items():
        setattr(record, key, value)

    db.commit()
    db.refresh(record)

    log_audit_event(db, user_id="SYSTEM", action="UPDATE_HSC", entity_type="HSCDetail",
                    entity_id=record.id, details=f"Updated HSC record {record_id}")

    return {"message": "HSC record updated successfully", "data": _serialize_hsc(record)}


# ─────────────────────────────────────────────────────────────
#  DELETE: SSLC record
# ─────────────────────────────────────────────────────────────
@router.delete("/sslc/{record_id}")
def delete_sslc_record(record_id: str, db: Session = Depends(get_db)):
    """Delete a SSLC record."""
    record = db.query(SSLCDetail).filter(SSLCDetail.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="SSLC record not found")
    db.delete(record)
    db.commit()
    log_audit_event(db, user_id="SYSTEM", action="DELETE_SSLC", entity_type="SSLCDetail",
                    entity_id=record_id, details="Deleted SSLC record")
    return {"message": "SSLC record deleted successfully"}


# ─────────────────────────────────────────────────────────────
#  DELETE: HSC record
# ─────────────────────────────────────────────────────────────
@router.delete("/hsc/{record_id}")
def delete_hsc_record(record_id: str, db: Session = Depends(get_db)):
    """Delete a HSC record."""
    record = db.query(HSCDetail).filter(HSCDetail.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="HSC record not found")
    db.delete(record)
    db.commit()
    log_audit_event(db, user_id="SYSTEM", action="DELETE_HSC", entity_type="HSCDetail",
                    entity_id=record_id, details="Deleted HSC record")
    return {"message": "HSC record deleted successfully"}


# ─────────────────────────────────────────────────────────────
#  REPORTS: Summary Statistics
# ─────────────────────────────────────────────────────────────
@router.get("/reports/summary")
def get_sslc_hsc_summary_report(db: Session = Depends(get_db)):
    """
    Aggregate summary report for all SSLC & HSC records:
    - Total students with/without records
    - Average percentage, cutoff
    - Board distribution
    - Pass rate analysis
    """
    total_students = db.query(Student).filter(Student.status == "Active").count()
    sslc_count = db.query(SSLCDetail).count()
    hsc_count = db.query(HSCDetail).count()

    # SSLC averages
    sslc_avg = db.query(
        func.avg(SSLCDetail.percentage),
        func.max(SSLCDetail.percentage),
        func.min(SSLCDetail.percentage),
        func.avg(SSLCDetail.mathematics),
        func.avg(SSLCDetail.science),
    ).first()

    # HSC averages
    hsc_avg = db.query(
        func.avg(HSCDetail.percentage),
        func.max(HSCDetail.percentage),
        func.min(HSCDetail.percentage),
        func.avg(HSCDetail.cutoff),
        func.avg(HSCDetail.physics),
        func.avg(HSCDetail.chemistry),
        func.avg(HSCDetail.mathematics),
    ).first()

    # Board distribution
    sslc_boards = db.query(SSLCDetail.board, func.count(SSLCDetail.id)).group_by(SSLCDetail.board).all()
    hsc_boards = db.query(HSCDetail.board, func.count(HSCDetail.id)).group_by(HSCDetail.board).all()

    # Passing year distribution
    sslc_years = db.query(SSLCDetail.passing_year, func.count(SSLCDetail.id)).group_by(SSLCDetail.passing_year).order_by(SSLCDetail.passing_year.desc()).limit(10).all()
    hsc_years = db.query(HSCDetail.passing_year, func.count(HSCDetail.id)).group_by(HSCDetail.passing_year).order_by(HSCDetail.passing_year.desc()).limit(10).all()

    # Percentage buckets
    def get_pct_buckets(model, col):
        return {
            "90_100": db.query(model).filter(col >= 90).count(),
            "80_89": db.query(model).filter(col >= 80, col < 90).count(),
            "70_79": db.query(model).filter(col >= 70, col < 80).count(),
            "60_69": db.query(model).filter(col >= 60, col < 70).count(),
            "below_60": db.query(model).filter(col < 60).count(),
        }

    sslc_pct_buckets = get_pct_buckets(SSLCDetail, SSLCDetail.percentage)
    hsc_pct_buckets = get_pct_buckets(HSCDetail, HSCDetail.percentage)

    return {
        "overview": {
            "total_active_students": total_students,
            "students_with_sslc_record": sslc_count,
            "students_with_hsc_record": hsc_count,
            "sslc_coverage_pct": round(sslc_count / total_students * 100, 1) if total_students else 0,
            "hsc_coverage_pct": round(hsc_count / total_students * 100, 1) if total_students else 0,
        },
        "sslc_stats": {
            "avg_percentage": round(sslc_avg[0] or 0, 2),
            "max_percentage": round(sslc_avg[1] or 0, 2),
            "min_percentage": round(sslc_avg[2] or 0, 2),
            "avg_mathematics": round(sslc_avg[3] or 0, 2),
            "avg_science": round(sslc_avg[4] or 0, 2),
            "board_distribution": {b: c for b, c in sslc_boards},
            "passing_year_distribution": {str(y): c for y, c in sslc_years if y},
            "percentage_buckets": sslc_pct_buckets,
        },
        "hsc_stats": {
            "avg_percentage": round(hsc_avg[0] or 0, 2),
            "max_percentage": round(hsc_avg[1] or 0, 2),
            "min_percentage": round(hsc_avg[2] or 0, 2),
            "avg_cutoff": round(hsc_avg[3] or 0, 2),
            "avg_physics": round(hsc_avg[4] or 0, 2),
            "avg_chemistry": round(hsc_avg[5] or 0, 2),
            "avg_mathematics": round(hsc_avg[6] or 0, 2),
            "board_distribution": {b: c for b, c in hsc_boards},
            "passing_year_distribution": {str(y): c for y, c in hsc_years if y},
            "percentage_buckets": hsc_pct_buckets,
        }
    }


# ─────────────────────────────────────────────────────────────
#  REPORTS: Per-student detailed report
# ─────────────────────────────────────────────────────────────
@router.get("/reports/student/{student_id}")
def get_student_school_report(student_id: str, db: Session = Depends(get_db)):
    """Detailed SSLC + HSC report for a single student (for PDF generation)."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    sslc = db.query(SSLCDetail).filter(SSLCDetail.student_id == student_id).first()
    hsc = db.query(HSCDetail).filter(HSCDetail.student_id == student_id).first()

    sslc_subjects = []
    if sslc:
        sslc_subjects = [
            {"subject": "Tamil", "marks": sslc.tamil, "max": 100},
            {"subject": "English", "marks": sslc.english, "max": 100},
            {"subject": "Mathematics", "marks": sslc.mathematics, "max": 100},
            {"subject": "Science", "marks": sslc.science, "max": 100},
            {"subject": "Social Science", "marks": sslc.social_science, "max": 100},
        ]
        if sslc.optional_subject:
            sslc_subjects.append({"subject": sslc.optional_subject, "marks": sslc.optional_marks, "max": 100})

    hsc_subjects = []
    if hsc:
        hsc_subjects = [
            {"subject": "Tamil / Language I", "marks": hsc.language1, "max": 100},
            {"subject": "English / Language II", "marks": hsc.language2, "max": 100},
            {"subject": "Physics", "marks": hsc.physics, "max": 100},
            {"subject": "Chemistry", "marks": hsc.chemistry, "max": 100},
            {"subject": "Mathematics", "marks": hsc.mathematics, "max": 100},
            {"subject": hsc.bio_cs_subject or "Biology", "marks": hsc.biology if hsc.bio_cs_subject == "Biology" else hsc.computer_science, "max": 100},
        ]

    return {
        "student": {
            "id": student.id,
            "register_number": student.register_number,
            "full_name": student.full_name,
            "department": student.department.name if student.department else None,
            "batch": student.batch,
        },
        "sslc": {
            **(_serialize_sslc(sslc) if sslc else {}),
            "subjects": sslc_subjects,
        } if sslc else None,
        "hsc": {
            **(_serialize_hsc(hsc) if hsc else {}),
            "subjects": hsc_subjects,
        } if hsc else None,
    }


# ─────────────────────────────────────────────────────────────
#  REPORTS: Top Performers
# ─────────────────────────────────────────────────────────────
@router.get("/reports/top-performers")
def get_top_performers(
    exam: str = Query("hsc", description="sslc or hsc"),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db)
):
    """Get top performing students by SSLC or HSC percentage."""
    if exam == "sslc":
        records = db.query(SSLCDetail).filter(SSLCDetail.percentage.isnot(None)).order_by(SSLCDetail.percentage.desc()).limit(limit).all()
        return [_serialize_sslc(r) for r in records]
    else:
        records = db.query(HSCDetail).filter(HSCDetail.percentage.isnot(None)).order_by(HSCDetail.percentage.desc()).limit(limit).all()
        return [_serialize_hsc(r) for r in records]


# ─────────────────────────────────────────────────────────────
#  UPSERT: Create or Update SSLC (convenience endpoint)
# ─────────────────────────────────────────────────────────────
@router.post("/sslc/upsert")
def upsert_sslc_record(payload: SSLCCreate, db: Session = Depends(get_db)):
    """Create or update SSLC record for a student."""
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    existing = db.query(SSLCDetail).filter(SSLCDetail.student_id == payload.student_id).first()

    percentage = payload.percentage
    if percentage is None and payload.total_marks and payload.max_marks:
        percentage = round((payload.total_marks / payload.max_marks) * 100, 2)

    if existing:
        for field, val in payload.model_dump(exclude_unset=True).items():
            if field != "student_id":
                setattr(existing, field, val)
        if percentage and not payload.percentage:
            existing.percentage = percentage
        db.commit()
        db.refresh(existing)
        return {"message": "SSLC record updated", "id": existing.id, "data": _serialize_sslc(existing)}
    else:
        record = SSLCDetail(**{k: v for k, v in payload.model_dump().items()}, percentage=percentage)
        db.add(record)
        db.commit()
        db.refresh(record)
        return {"message": "SSLC record created", "id": record.id, "data": _serialize_sslc(record)}


# ─────────────────────────────────────────────────────────────
#  UPSERT: Create or Update HSC (convenience endpoint)
# ─────────────────────────────────────────────────────────────
@router.post("/hsc/upsert")
def upsert_hsc_record(payload: HSCCreate, db: Session = Depends(get_db)):
    """Create or update HSC record for a student."""
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    existing = db.query(HSCDetail).filter(HSCDetail.student_id == payload.student_id).first()

    percentage = payload.percentage
    if percentage is None and payload.total_marks and payload.max_marks:
        percentage = round((payload.total_marks / payload.max_marks) * 100, 2)

    cutoff = payload.cutoff
    if cutoff is None:
        cutoff = compute_hsc_cutoff(
            payload.physics, payload.chemistry, payload.mathematics,
            payload.biology, payload.computer_science, payload.bio_cs_subject or "Biology"
        )

    if existing:
        for field, val in payload.model_dump(exclude_unset=True).items():
            if field != "student_id":
                setattr(existing, field, val)
        if percentage and not payload.percentage:
            existing.percentage = percentage
        if cutoff and not payload.cutoff:
            existing.cutoff = cutoff
        db.commit()
        db.refresh(existing)
        return {"message": "HSC record updated", "id": existing.id, "data": _serialize_hsc(existing)}
    else:
        record = HSCDetail(**{k: v for k, v in payload.model_dump().items()}, percentage=percentage, cutoff=cutoff)
        db.add(record)
        db.commit()
        db.refresh(record)
        return {"message": "HSC record created", "id": record.id, "data": _serialize_hsc(record)}


# ─────────────────────────────────────────────────────────────
#  PRIVATE SERIALIZERS
# ─────────────────────────────────────────────────────────────
def _serialize_sslc(r: SSLCDetail) -> dict:
    return {
        "id": r.id,
        "student_id": r.student_id,
        "school_name": r.school_name,
        "board": r.board,
        "passing_year": r.passing_year,
        "register_number": r.register_number,
        "total_marks": r.total_marks,
        "max_marks": r.max_marks,
        "percentage": r.percentage,
        "subjects": {
            "tamil": r.tamil,
            "english": r.english,
            "mathematics": r.mathematics,
            "science": r.science,
            "social_science": r.social_science,
            "optional_subject": r.optional_subject,
            "optional_marks": r.optional_marks,
        },
        "remarks": r.remarks,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
    }


def _serialize_hsc(r: HSCDetail) -> dict:
    return {
        "id": r.id,
        "student_id": r.student_id,
        "school_name": r.school_name,
        "board": r.board,
        "passing_year": r.passing_year,
        "register_number": r.register_number,
        "stream": r.stream,
        "total_marks": r.total_marks,
        "max_marks": r.max_marks,
        "percentage": r.percentage,
        "cutoff": r.cutoff,
        "bio_cs_subject": r.bio_cs_subject,
        "subjects": {
            "physics": r.physics,
            "chemistry": r.chemistry,
            "mathematics": r.mathematics,
            "biology": r.biology,
            "computer_science": r.computer_science,
            "language1": r.language1,
            "language2": r.language2,
        },
        "remarks": r.remarks,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
    }
