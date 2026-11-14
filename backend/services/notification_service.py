from typing import Optional
from sqlalchemy.orm import Session
import models

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    type: str = "info",
    complaint_id: Optional[int] = None
) -> models.Notification:
    """
    Persists an in-app notification for a user.
    """
    notif = models.Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        complaint_id=complaint_id,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

def notify_admins(
    db: Session,
    title: str,
    message: str,
    type: str = "alert",
    complaint_id: Optional[int] = None
):
    """
    Dispatches notifications to all administrators (e.g. for critical emergencies or verification reviews).
    """
    admins = db.query(models.User).filter(models.User.role == "admin").all()
    for admin in admins:
        create_notification(db, admin.id, title, message, type, complaint_id)

def log_activity(
    db: Session,
    action: str,
    details: str,
    user_id: Optional[int] = None,
    user_name: str = "System"
):
    """
    Audit logging for security and traceability.
    """
    log_entry = models.ActivityLog(
        user_id=user_id,
        user_name=user_name,
        action=action,
        details=details
    )
    db.add(log_entry)
    db.commit()
