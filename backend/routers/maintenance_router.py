from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List, Any
from database import get_db
import models
import schemas
from auth import require_maintenance_or_admin
from services.notification_service import create_notification, log_activity

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])

@router.get("/kanban", response_model=Dict[str, List[schemas.ComplaintResponse]])
def get_kanban_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_maintenance_or_admin)
):
    """
    Returns tasks organized into Kanban columns:
    - Assigned
    - In Progress
    - Awaiting Verification
    - Resolved
    """
    query = db.query(models.Complaint)
    
    # Return all campus tasks organized into Kanban stages so staff has full visibility of work orders
    complaints = query.order_by(models.Complaint.priority_score.desc()).all()

    kanban = {
        "Assigned": [],
        "In Progress": [],
        "Awaiting Verification": [],
        "Resolved": []
    }

    for c in complaints:
        if c.status in ["Submitted", "AI Analysed", "Assigned", "Reopened"]:
            kanban["Assigned"].append(c)
        elif c.status == "In Progress":
            kanban["In Progress"].append(c)
        elif c.status == "Awaiting Verification":
            kanban["Awaiting Verification"].append(c)
        elif c.status == "Resolved":
            kanban["Resolved"].append(c)

    return kanban


@router.post("/accept/{complaint_id}", response_model=schemas.ComplaintResponse)
def accept_task(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_maintenance_or_admin)
):
    """
    Technician formally accepts a task and moves status to 'In Progress'.
    """
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.assigned_technician_id = current_user.id
    complaint.status = "In Progress"

    db.commit()
    db.refresh(complaint)

    # Notify student
    create_notification(
        db,
        user_id=complaint.student_id,
        title="Technician On Site",
        message=f"{current_user.full_name} has accepted task #{complaint.id} and commenced repair work.",
        type="info",
        complaint_id=complaint.id
    )

    log_activity(
        db,
        action="TASK_ACCEPTED",
        details=f"Technician {current_user.full_name} accepted Work Order #{complaint.id}.",
        user_id=current_user.id,
        user_name=current_user.full_name
    )

    return complaint


@router.get("/workload")
def get_workload_metrics(db: Session = Depends(get_db)):
    """
    Returns live workload metrics across all maintenance departments.
    """
    departments = db.query(models.Department).all()
    metrics = []

    for d in departments:
        active_count = db.query(models.Complaint).filter(
            models.Complaint.department_id == d.id,
            models.Complaint.status.in_(["Submitted", "AI Analysed", "Assigned", "In Progress", "Awaiting Verification"])
        ).count()

        resolved_count = db.query(models.Complaint).filter(
            models.Complaint.department_id == d.id,
            models.Complaint.status == "Resolved"
        ).count()

        critical_count = db.query(models.Complaint).filter(
            models.Complaint.department_id == d.id,
            models.Complaint.severity.in_(["High", "Critical"]),
            models.Complaint.status != "Resolved"
        ).count()

        metrics.append({
            "department_id": d.id,
            "department_name": d.name,
            "code": d.code,
            "head_name": d.head_name,
            "active_tasks": active_count,
            "resolved_tasks": resolved_count,
            "critical_tasks": critical_count,
            "capacity_status": "Overloaded" if active_count >= 5 else "Optimal" if active_count >= 2 else "Available"
        })

    return metrics
