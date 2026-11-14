from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from database import get_db
import models
import schemas
from auth import require_admin
from services.predictive_service import calculate_campus_health_score, detect_recurring_problems
from services.notification_service import create_notification, log_activity
from services.supabase_service import supabase_service

router = APIRouter(prefix="/api/admin", tags=["Administrator"])

@router.get("/health-score", response_model=schemas.CampusHealthScore)
def get_health_score(db: Session = Depends(get_db)):
    """
    Returns the dynamic Campus Health Score (0-100) and full breakdown.
    """
    return calculate_campus_health_score(db)


@router.get("/overview")
def get_admin_overview(db: Session = Depends(get_db)):
    """
    Executive dashboard metrics:
    Total, active, critical incidents, resolved count, avg resolution turnaround.
    """
    total = db.query(models.Complaint).count()
    active = db.query(models.Complaint).filter(
        models.Complaint.status.in_(["Submitted", "AI Analysed", "Assigned", "In Progress", "Awaiting Verification"])
    ).count()
    critical = db.query(models.Complaint).filter(
        models.Complaint.severity.in_(["High", "Critical"]),
        models.Complaint.status != "Resolved"
    ).count()
    resolved = db.query(models.Complaint).filter(models.Complaint.status == "Resolved").count()
    reopened = db.query(models.Complaint).filter(models.Complaint.status == "Reopened").count()

    health = calculate_campus_health_score(db)
    hotspots = detect_recurring_problems(db)

    return {
        "total_complaints": total,
        "active_complaints": active,
        "critical_incidents": critical,
        "resolved_complaints": resolved,
        "reopened_complaints": reopened,
        "campus_health_score": health["score"],
        "campus_health_label": health["status_label"],
        "avg_resolution_hours": health["avg_resolution_hours"],
        "recurring_hotspots_count": len(hotspots),
        "supabase": supabase_service.get_status()
    }


@router.get("/supabase-status")
def get_supabase_status():
    """
    Returns live connectivity and health metrics for the Supabase cloud integration.
    """
    return supabase_service.get_status()


@router.post("/override-assignment/{complaint_id}", response_model=schemas.ComplaintResponse)
def override_assignment(
    complaint_id: int,
    payload: schemas.ComplaintAssignRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """
    Administrator manual override for department, technician, or priority score.
    """
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    old_dept_id = complaint.department_id
    old_tech_id = complaint.assigned_technician_id
    old_priority = complaint.priority_score

    if payload.department_id is not None:
        complaint.department_id = payload.department_id
        # Also assign technician in new department if present
        dept_tech = db.query(models.User).filter(
            models.User.role == "maintenance",
            models.User.department_id == payload.department_id
        ).first()
        if dept_tech and payload.assigned_technician_id is None:
            complaint.assigned_technician_id = dept_tech.id
            if complaint.status in ["Submitted", "AI Analysed"]:
                complaint.status = "Assigned"

    if payload.assigned_technician_id is not None:
        complaint.assigned_technician_id = payload.assigned_technician_id
        complaint.status = "Assigned"

    if payload.priority_score is not None:
        complaint.priority_score = max(0, min(100, payload.priority_score))
        if complaint.priority_score >= 90:
            complaint.severity = "Critical"
        elif complaint.priority_score >= 70:
            complaint.severity = "High"
        elif complaint.priority_score >= 40:
            complaint.severity = "Medium"
        else:
            complaint.severity = "Low"

    db.commit()
    db.refresh(complaint)

    # Notifications
    tech_to_notify = payload.assigned_technician_id or complaint.assigned_technician_id
    if tech_to_notify:
        create_notification(
            db,
            user_id=tech_to_notify,
            title="Work Order Reassigned by Admin",
            message=f"Administrator reassigned ticket #{complaint.id} ({complaint.title}) to you. Priority: {complaint.priority_score}/100.",
            type="alert",
            complaint_id=complaint.id
        )

    log_activity(
        db,
        action="ADMIN_OVERRIDE",
        details=f"Admin {admin.full_name} overridden assignment for #{complaint.id}: Dept ({old_dept_id}->{complaint.department_id}), Tech ({old_tech_id}->{complaint.assigned_technician_id}), Priority ({old_priority}->{complaint.priority_score}).",
        user_id=admin.id,
        user_name=admin.full_name
    )

    return complaint


@router.get("/resource-suggestions")
def get_resource_planning_suggestions(db: Session = Depends(get_db)):
    """
    FEATURE E: SMART RESOURCE PLANNING
    Estimates maintenance workload and suggests staff rebalancing.
    """
    departments = db.query(models.Department).all()
    suggestions = []

    for d in departments:
        open_count = db.query(models.Complaint).filter(
            models.Complaint.department_id == d.id,
            models.Complaint.status.in_(["Submitted", "AI Analysed", "Assigned", "In Progress", "Awaiting Verification"])
        ).count()

        critical_count = db.query(models.Complaint).filter(
            models.Complaint.department_id == d.id,
            models.Complaint.severity.in_(["High", "Critical"]),
            models.Complaint.status != "Resolved"
        ).count()

        est_hours = open_count * 2.5 + critical_count * 4.0

        if open_count >= 4 or critical_count >= 2:
            action = f"Temporarily reassign 1-2 technicians to {d.name} to clear high-priority backlog."
            severity = "High"
        elif open_count == 0:
            action = f"{d.name} has zero pending tickets; technicians can assist other overburdened teams."
            severity = "Low"
        else:
            action = f"{d.name} workload is balanced within target SLA."
            severity = "Nominal"

        suggestions.append({
            "department_id": d.id,
            "department_name": d.name,
            "open_tickets": open_count,
            "critical_tickets": critical_count,
            "estimated_effort_hours": round(est_hours, 1),
            "recommendation": action,
            "urgency": severity
        })

    suggestions.sort(key=lambda x: x["estimated_effort_hours"], reverse=True)
    return suggestions


@router.get("/audit-logs")
def get_audit_logs(db: Session = Depends(get_db), limit: int = 25):
    logs = db.query(models.ActivityLog).order_by(models.ActivityLog.id.desc()).limit(limit).all()
    return logs


@router.get("/export-report")
def export_campus_report(db: Session = Depends(get_db)):
    """
    Generates structured export report of all complaints, metrics, and verifications.
    """
    health = calculate_campus_health_score(db)
    complaints = db.query(models.Complaint).all()
    hotspots = detect_recurring_problems(db)

    return {
        "export_timestamp": datetime.datetime.utcnow().isoformat(),
        "campus_health_score": health,
        "recurring_hotspots": hotspots,
        "total_complaints_recorded": len(complaints),
        "complaints_records": [
            {
                "id": c.id,
                "title": c.title,
                "category": c.category,
                "building": c.building.name if c.building else "",
                "room": c.room,
                "priority_score": c.priority_score,
                "severity": c.severity,
                "status": c.status,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "resolved_at": c.resolved_at.isoformat() if c.resolved_at else None,
            }
            for c in complaints
        ]
    }
import datetime
