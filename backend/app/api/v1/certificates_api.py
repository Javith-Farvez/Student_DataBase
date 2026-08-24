import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Student, CertificateItem, CertificateVersion, AuditLog
from app.services.storage_service import storage_engine
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/certificates", tags=["Certificate & Achievement Management"])

ALLOWED_CERT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"]

# --- 1. UPLOAD CERTIFICATE RECORD WITH PERMANENT FILE STORAGE ---
@router.post("/upload/{student_id}", status_code=status.HTTP_201_CREATED)
def upload_student_certificate(
    student_id: str,
    name: str = Form(...),
    type: str = Form("Hackathon Winner"),
    issued_by: Optional[str] = Form(None),
    certificate_number: Optional[str] = Form(None),
    issue_date: Optional[str] = Form(None),
    achievement: Optional[str] = Form(None),
    position: Optional[str] = Form(None),
    level: Optional[str] = Form(None),
    participation_status: Optional[str] = Form("Winner"),
    description: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    uploaded_by: Optional[str] = Form("Staff"),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    file_path = None
    file_name = None
    file_type = None
    file_size_bytes = None

    if file and file.filename:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_CERT_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file extension '{ext}'. Allowed: {', '.join(ALLOWED_CERT_EXTENSIONS)}"
            )
        file_path, file_name, file_size_bytes = storage_engine.save_file(file, student.id, f"cert_{type}")
        file_type = ext.replace(".", "").upper()

    cert = CertificateItem(
        student_id=student.id,
        name=name,
        type=type,
        issued_by=issued_by,
        issue_date=issue_date,
        certificate_number=certificate_number,
        achievement=achievement,
        participation_status=participation_status or "Winner",
        position=position,
        level=level,
        description=description,
        file_path=file_path,
        file_name=file_name,
        file_type=file_type,
        file_size_bytes=file_size_bytes,
        version=1,
        is_archived=False,
        uploaded_by=uploaded_by or "Staff",
        notes=notes
    )

    db.add(cert)
    db.commit()
    db.refresh(cert)

    log_audit_event(
        db,
        user_id=uploaded_by or "STF001",
        action="ADD_CERTIFICATE",
        entity_type="CertificateItem",
        entity_id=cert.id,
        details=f"Added certificate '{name}' ({type}) for student {student.full_name} ({student.register_number})"
    )

    return {
        "message": f"🎉 Certificate '{name}' successfully uploaded and stored permanently for {student.full_name}!",
        "certificate_id": cert.id,
        "certificate": {
            "id": cert.id,
            "student_id": cert.student_id,
            "name": cert.name,
            "type": cert.type,
            "issued_by": cert.issued_by,
            "issue_date": cert.issue_date,
            "certificate_number": cert.certificate_number,
            "achievement": cert.achievement,
            "participation_status": cert.participation_status,
            "position": cert.position,
            "level": cert.level,
            "description": cert.description,
            "file_name": cert.file_name,
            "file_path": cert.file_path,
            "file_type": cert.file_type,
            "file_size_bytes": cert.file_size_bytes,
            "version": cert.version,
            "is_archived": cert.is_archived,
            "notes": cert.notes,
            "created_at": cert.created_at.isoformat() if cert.created_at else None
        }
    }


# --- 2. GET ALL CERTIFICATES FOR A STUDENT ---
@router.get("/student/{student_id}")
def get_student_certificates(student_id: str, include_archived: bool = False, db: Session = Depends(get_db)):
    student = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    query = db.query(CertificateItem).filter(CertificateItem.student_id == student.id)
    if not include_archived:
        query = query.filter(CertificateItem.is_archived == False)

    certs = query.order_by(CertificateItem.created_at.desc()).all()

    result = []
    for c in certs:
        versions = db.query(CertificateVersion).filter(CertificateVersion.certificate_id == c.id).order_by(CertificateVersion.version_number.desc()).all()
        result.append({
            "id": c.id,
            "student_id": c.student_id,
            "name": c.name,
            "type": c.type,
            "issued_by": c.issued_by,
            "issue_date": c.issue_date,
            "certificate_number": c.certificate_number,
            "achievement": c.achievement,
            "participation_status": c.participation_status,
            "position": c.position,
            "level": c.level,
            "description": c.description,
            "file_name": c.file_name,
            "file_path": c.file_path,
            "file_type": c.file_type,
            "file_size_bytes": c.file_size_bytes,
            "version": c.version,
            "is_archived": c.is_archived,
            "uploaded_by": c.uploaded_by,
            "notes": c.notes,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "versions": [{
                "version_number": v.version_number,
                "file_name": v.file_name,
                "uploaded_at": v.created_at.isoformat(),
                "reason": v.reason_for_replacement
            } for v in versions]
        })

    return {"student_id": student.id, "total": len(result), "certificates": result}


# --- 3. PREVIEW CERTIFICATE FILE ---
@router.get("/preview/{certificate_id}")
def preview_certificate_file(certificate_id: str, db: Session = Depends(get_db)):
    cert = db.query(CertificateItem).filter(CertificateItem.id == certificate_id).first()
    if not cert or not cert.file_path:
        raise HTTPException(status_code=404, detail="Certificate or file not found")

    full_path = storage_engine.get_file_path(cert.file_path)
    if not full_path or not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Certificate file on disk not found")

    ext = os.path.splitext(full_path)[1].lower()
    media_type = "application/pdf"
    if ext in [".jpg", ".jpeg"]:
        media_type = "image/jpeg"
    elif ext == ".png":
        media_type = "image/png"
    elif ext == ".webp":
        media_type = "image/webp"

    log_audit_event(db, user_id="STF001", action="PREVIEW_CERTIFICATE", entity_type="CertificateItem", entity_id=cert.id, details=f"Previewed certificate '{cert.name}'")

    return FileResponse(full_path, media_type=media_type, filename=cert.file_name)


# --- 4. DOWNLOAD CERTIFICATE FILE ---
@router.get("/download/{certificate_id}")
def download_certificate_file(certificate_id: str, db: Session = Depends(get_db)):
    cert = db.query(CertificateItem).filter(CertificateItem.id == certificate_id).first()
    if not cert or not cert.file_path:
        raise HTTPException(status_code=404, detail="Certificate or file not found")

    full_path = storage_engine.get_file_path(cert.file_path)
    if not full_path or not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Certificate file on disk not found")

    log_audit_event(db, user_id="STF001", action="DOWNLOAD_CERTIFICATE", entity_type="CertificateItem", entity_id=cert.id, details=f"Downloaded certificate '{cert.name}'")

    return FileResponse(full_path, filename=cert.file_name or "Certificate.pdf", media_type="application/octet-stream")


# --- 5. UPDATE CERTIFICATE RECORD & VERSION HISTORY ---
@router.put("/{certificate_id}")
def update_student_certificate(
    certificate_id: str,
    name: Optional[str] = Form(None),
    type: Optional[str] = Form(None),
    issued_by: Optional[str] = Form(None),
    certificate_number: Optional[str] = Form(None),
    issue_date: Optional[str] = Form(None),
    achievement: Optional[str] = Form(None),
    position: Optional[str] = Form(None),
    level: Optional[str] = Form(None),
    participation_status: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    reason: Optional[str] = Form("Metadata / Certificate File Update"),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    cert = db.query(CertificateItem).filter(CertificateItem.id == certificate_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate item not found")

    # Handle replacement file versioning
    if file and file.filename:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_CERT_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Invalid file extension. Allowed: {', '.join(ALLOWED_CERT_EXTENSIONS)}")

        # Save previous version in CertificateVersion table
        version_rec = CertificateVersion(
            certificate_id=cert.id,
            student_id=cert.student_id,
            version_number=cert.version,
            name=cert.name,
            type=cert.type,
            issued_by=cert.issued_by,
            issue_date=cert.issue_date,
            certificate_number=cert.certificate_number,
            achievement=cert.achievement,
            file_name=cert.file_name,
            file_path=cert.file_path,
            file_size_bytes=cert.file_size_bytes,
            uploaded_by=cert.uploaded_by or "Staff",
            reason_for_replacement=reason
        )
        db.add(version_rec)

        # Upload new file
        new_path, new_name, new_size = storage_engine.save_file(file, cert.student_id, f"cert_{cert.type}")
        cert.file_path = new_path
        cert.file_name = new_name
        cert.file_size_bytes = new_size
        cert.file_type = ext.replace(".", "").upper()
        cert.version += 1

    if name: cert.name = name
    if type: cert.type = type
    if issued_by is not None: cert.issued_by = issued_by
    if certificate_number is not None: cert.certificate_number = certificate_number
    if issue_date is not None: cert.issue_date = issue_date
    if achievement is not None: cert.achievement = achievement
    if position is not None: cert.position = position
    if level is not None: cert.level = level
    if participation_status is not None: cert.participation_status = participation_status
    if description is not None: cert.description = description
    if notes is not None: cert.notes = notes

    db.commit()
    db.refresh(cert)

    log_audit_event(db, user_id="STF001", action="UPDATE_CERTIFICATE", entity_type="CertificateItem", entity_id=cert.id, details=f"Updated certificate '{cert.name}' (Version {cert.version})")

    return {"message": f"🎉 Certificate '{cert.name}' updated successfully (Version {cert.version})!", "certificate_id": cert.id, "version": cert.version}


# --- 6. ARCHIVE CERTIFICATE (STAFF & HOD) ---
@router.post("/{certificate_id}/archive")
def archive_certificate(certificate_id: str, db: Session = Depends(get_db)):
    cert = db.query(CertificateItem).filter(CertificateItem.id == certificate_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    cert.is_archived = True
    db.commit()

    log_audit_event(db, user_id="STF001", action="ARCHIVE_CERTIFICATE", entity_type="CertificateItem", entity_id=cert.id, details=f"Archived certificate '{cert.name}'")

    return {"message": f"📁 Certificate '{cert.name}' has been archived."}


# --- 7. RESTORE CERTIFICATE (ADMIN) ---
@router.post("/{certificate_id}/restore")
def restore_certificate(certificate_id: str, db: Session = Depends(get_db)):
    cert = db.query(CertificateItem).filter(CertificateItem.id == certificate_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    cert.is_archived = False
    db.commit()

    log_audit_event(db, user_id="ADMIN001", action="RESTORE_CERTIFICATE", entity_type="CertificateItem", entity_id=cert.id, details=f"Restored certificate '{cert.name}'")

    return {"message": f"🎉 Certificate '{cert.name}' restored successfully!"}


# --- 8. PERMANENT DELETE CERTIFICATE (ADMIN ONLY) ---
@router.delete("/{certificate_id}")
def delete_certificate(certificate_id: str, db: Session = Depends(get_db)):
    cert = db.query(CertificateItem).filter(CertificateItem.id == certificate_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    name = cert.name
    # Delete versions
    db.query(CertificateVersion).filter(CertificateVersion.certificate_id == cert.id).delete()
    db.delete(cert)
    db.commit()

    log_audit_event(db, user_id="ADMIN001", action="DELETE_CERTIFICATE", entity_type="CertificateItem", entity_id=certificate_id, details=f"Permanently deleted certificate '{name}'")

    return {"message": f"🗑️ Certificate '{name}' permanently deleted."}
