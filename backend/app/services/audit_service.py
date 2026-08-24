from sqlalchemy.orm import Session
from app.models.models import AuditLog

def log_audit_event(
    db: Session,
    user_id: str,
    action: str,
    entity_type: str,
    entity_id: str = None,
    details: str = None,
    ip_address: str = "127.0.0.1"
):
    """Logs security audit actions into PostgreSQL audit_logs table"""
    try:
        log = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details,
            ip_address=ip_address
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"[Audit Log Error]: Failed to write audit log entry: {e}")
