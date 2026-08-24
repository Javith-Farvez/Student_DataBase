import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    Student, StudentDocumentItem, DocumentVersion, DocumentAccessLog,
    ScholarshipDetail, FirstGraduateDetail, NativityDetail, AuditLog
)
from app.services.storage_service import storage_engine
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/documents", tags=["Document Vault & Scholarship Management"])

ALLOWED_DOC_TYPES = [
    # Identity
    "aadhaar_card", "passport", "pan_card", "driving_licence", "voter_id", "other_gov_id",
    # Academic
    "mark_10th", "mark_12th", "transfer_certificate", "bonafide_certificate", "migration_certificate",
    "school_leaving", "birth_certificate", "admission_certificate", "previous_marksheet", "diploma_certificate", "degree_certificate",
    # Community & Category
    "community_certificate", "caste_certificate", "income_certificate", "nativity_certificate", "residence_certificate", "domicile_certificate",
    # Scholarship & First Graduate
    "first_graduate_certificate", "scholarship_document",
    # Medical
    "medical_certificate", "fitness_certificate", "disability_certificate", "blood_group_certificate",
    # Achievements
    "hackathon_winner", "hackathon_participation", "coding_contest", "paper_presentation", "conference", "workshop", "seminar", "sports", "nss", "ncc",
    # Internship
    "internship_offer", "internship_completion", "internship_experience", "internship_report",
    # Online Courses
    "online_course_nptel", "online_course_coursera", "online_course_edx", "other"
]

MANDATORY_CHECKLIST = [
    {"type": "aadhaar_card", "label": "Aadhaar Card", "category": "Identity"},
    {"type": "mark_10th", "label": "10th SSLC Marksheet", "category": "Academic"},
    {"type": "mark_12th", "label": "12th HSC Marksheet", "category": "Academic"},
    {"type": "transfer_certificate", "label": "Transfer Certificate (TC)", "category": "Academic"},
    {"type": "community_certificate", "label": "Community Certificate", "category": "Community"},
    {"type": "income_certificate", "label": "Income Certificate", "category": "Community"},
    {"type": "nativity_certificate", "label": "Nativity Certificate", "category": "Community"},
    {"type": "first_graduate_certificate", "label": "First Graduate Certificate", "category": "Scholarship"}
]


# --- 1. FULL DOCUMENT VAULT & PROFILES ENDPOINT ---
@router.get("/student/{student_id}/full-vault")
def get_full_document_vault(student_id: str, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")

    items = db.query(StudentDocumentItem).filter(StudentDocumentItem.student_id == st.id).all()
    uploaded_types = {d.document_type: d for d in items}

    # Build Categories
    vault_categories = {
        "Identity Documents": [],
        "Academic Documents": [],
        "Government & Community Certificates": [],
        "Scholarship Documents": [],
        "Medical Documents": [],
        "Achievement Documents": [],
        "Internship Documents": [],
        "Other Documents": []
    }

    for d in items:
        dtype = d.document_type
        versions = db.query(DocumentVersion).filter(DocumentVersion.document_id == d.id).order_by(DocumentVersion.version_number.desc()).all()
        doc_obj = {
            "id": d.id,
            "document_type": d.document_type,
            "document_name": getattr(d, 'document_name', None) or d.file_name,
            "file_name": d.file_name,
            "file_path": d.file_path,
            "file_size_bytes": d.file_size_bytes,
            "version": d.version,
            "verification_status": getattr(d, 'verification_status', 'Verified') or 'Verified',
            "uploaded_by": d.uploaded_by or "Staff",
            "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None,
            "versions": [{
                "version_number": v.version_number,
                "file_name": v.file_name,
                "uploaded_at": v.uploaded_at.isoformat(),
                "reason": v.reason_for_replacement
            } for v in versions]
        }

        if "aadhaar" in dtype or "passport" in dtype or "pan" in dtype or "driving" in dtype or "voter" in dtype:
            vault_categories["Identity Documents"].append(doc_obj)
        elif "mark_" in dtype or "transfer_" in dtype or "bonafide" in dtype or "migration" in dtype or "school" in dtype or "degree" in dtype:
            vault_categories["Academic Documents"].append(doc_obj)
        elif "community" in dtype or "caste" in dtype or "income" in dtype or "nativity" in dtype or "residence" in dtype:
            vault_categories["Government & Community Certificates"].append(doc_obj)
        elif "first_graduate" in dtype or "scholarship" in dtype:
            vault_categories["Scholarship Documents"].append(doc_obj)
        elif "medical" in dtype or "fitness" in dtype or "disability" in dtype or "blood" in dtype:
            vault_categories["Medical Documents"].append(doc_obj)
        elif "hackathon" in dtype or "coding" in dtype or "sports" in dtype or "nss" in dtype or "ncc" in dtype or "course" in dtype:
            vault_categories["Achievement Documents"].append(doc_obj)
        elif "internship" in dtype:
            vault_categories["Internship Documents"].append(doc_obj)
        else:
            vault_categories["Other Documents"].append(doc_obj)

    # Checklist Evaluation
    checklist = []
    missing_count = 0
    for item in MANDATORY_CHECKLIST:
        is_uploaded = item["type"] in uploaded_types
        if not is_uploaded:
            missing_count += 1
        checklist.append({
            "type": item["type"],
            "label": item["label"],
            "category": item["category"],
            "status": "Uploaded" if is_uploaded else "DOCUMENT REQUIRED",
            "document_id": uploaded_types[item["type"]].id if is_uploaded else None
        })

    # Fetch Profiles
    schol = db.query(ScholarshipDetail).filter(ScholarshipDetail.student_id == st.id).first()
    fg = db.query(FirstGraduateDetail).filter(FirstGraduateDetail.student_id == st.id).first()
    nat = db.query(NativityDetail).filter(NativityDetail.student_id == st.id).first()

    # Log Access
    log_audit_event(db, user_id="STF001", action="VIEW_DOCUMENT_VAULT", entity_type="DocumentVault", entity_id=st.id, details=f"Accessed document vault of {st.full_name}")

    return {
        "summary": {
            "total_documents": len(items),
            "uploaded": len(items),
            "verified": len([d for d in items if getattr(d, 'verification_status', 'Verified') == 'Verified']),
            "pending_verification": len([d for d in items if getattr(d, 'verification_status', 'Verified') == 'Pending Verification']),
            "missing_required": missing_count
        },
        "checklist": checklist,
        "categories": vault_categories,
        "masked_identity": {
            "aadhaar_number": "XXXX XXXX 1234",
            "pan_number": "ABCDE1234F",
            "passport_number": "A1234567"
        },
        "scholarship_profile": {
            "scholarship_name": schol.scholarship_name if schol else "Government First Graduate Tuition Fee Waiver",
            "scholarship_provider": schol.scholarship_provider if schol else "Government of Tamil Nadu",
            "academic_year": schol.academic_year if schol else "2024-2025",
            "amount": schol.amount if schol else 25000.0,
            "application_status": schol.application_status if schol else "Approved",
            "renewal_status": schol.renewal_status if schol else "Renewed"
        },
        "first_graduate_profile": {
            "is_first_graduate": fg.is_first_graduate if fg else True,
            "certificate_number": fg.certificate_number if fg else "FG2021004921",
            "issue_date": fg.issue_date if fg else "2021-06-15",
            "verification_status": fg.verification_status if fg else "Verified",
            "amount": fg.amount if fg else 25000.0
        },
        "native_profile": {
            "native_state": nat.native_state if nat else "Tamil Nadu",
            "native_district": nat.native_district if nat else "Karur",
            "native_taluk": nat.native_taluk if nat else "Karur",
            "native_village": nat.native_village if nat else "Thanthonimalai",
            "native_pincode": nat.native_pincode if nat else "639005",
            "nativity_status": nat.nativity_status if nat else "Native of Tamil Nadu",
            "verification_status": nat.verification_status if nat else "Verified"
        }
    }


# --- 2. DOCUMENT UPLOAD WITH VERSIONING & AUDIT LOGGING ---
@router.post("/upload/{student_id}")
def upload_student_document(
    student_id: str,
    doc_type: str = Form(...),
    reason: Optional[str] = Form("Standard Document Upload"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Extension & File Type Validation
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".jpg", ".jpeg", ".png"]:
        raise HTTPException(status_code=400, detail="Invalid file extension. Only .pdf, .jpg, .jpeg, and .png files are accepted.")

    # Unique Cloud-Ready Storage Filename
    file_path, file_name, file_size = storage_engine.save_file(file, student.id, doc_type)

    existing = db.query(StudentDocumentItem).filter(
        StudentDocumentItem.student_id == student.id,
        StudentDocumentItem.document_type == doc_type
    ).first()

    if existing:
        # Record Previous Version History
        version_rec = DocumentVersion(
            document_id=existing.id,
            student_id=student.id,
            version_number=existing.version,
            file_name=existing.file_name,
            file_path=existing.file_path,
            file_size_bytes=existing.file_size_bytes,
            uploaded_by=existing.uploaded_by or "Staff",
            reason_for_replacement=reason
        )
        db.add(version_rec)

        existing.file_name = file_name
        existing.file_path = file_path
        existing.file_size_bytes = file_size
        existing.version += 1
        db.commit()
        db.refresh(existing)
        item = existing
    else:
        item = StudentDocumentItem(
            student_id=student.id,
            document_type=doc_type,
            file_name=file_name,
            file_path=file_path,
            file_size_bytes=file_size,
            uploaded_by="AIDS001",
            version=1
        )
        db.add(item)
        db.commit()
        db.refresh(item)

    # Log Document Access & Audit Event
    access_log = DocumentAccessLog(
        document_id=item.id,
        student_id=student.id,
        action="UPLOAD" if not existing else "REPLACE",
        user_id="AIDS001",
        role="STAFF"
    )
    db.add(access_log)
    log_audit_event(db, user_id="AIDS001", action="UPLOAD_DOCUMENT", entity_type="StudentDocumentItem", entity_id=item.id, details=f"Uploaded {doc_type} (Version {item.version}) for {student.full_name}")

    db.commit()

    return {
        "message": f"🎉 Document '{doc_type}' uploaded successfully (Version {item.version})!",
        "document_id": item.id,
        "file_name": item.file_name,
        "file_path": item.file_path,
        "version": item.version
    }


# --- 3. DOWNLOAD & PREVIEW ENDPOINTS WITH AUDIT LOGGING ---
@router.get("/preview/{document_id}")
def preview_document(document_id: str, db: Session = Depends(get_db)):
    item = db.query(StudentDocumentItem).filter(StudentDocumentItem.id == document_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Document item not found")

    full_path = storage_engine.get_file_path(item.file_path)
    if not full_path or not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File on disk not found")

    # Log Access
    db.add(DocumentAccessLog(document_id=item.id, student_id=item.student_id, action="PREVIEW", user_id="AIDS001", role="STAFF"))
    db.commit()

    return FileResponse(full_path, filename=item.file_name)

@router.get("/download/{document_id}")
def download_document(document_id: str, db: Session = Depends(get_db)):
    item = db.query(StudentDocumentItem).filter(StudentDocumentItem.id == document_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Document item not found")

    full_path = storage_engine.get_file_path(item.file_path)
    if not full_path or not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File on disk not found")

    # Log Access
    db.add(DocumentAccessLog(document_id=item.id, student_id=item.student_id, action="DOWNLOAD", user_id="AIDS001", role="STAFF"))
    db.commit()

    return FileResponse(full_path, filename=item.file_name, media_type="application/octet-stream")
