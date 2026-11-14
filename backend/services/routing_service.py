from sqlalchemy.orm import Session
from typing import Optional, Tuple
import models

DEPARTMENT_MAPPING = {
    "Electrical": "ELEC",
    "Plumbing": "PLUMB",
    "Water supply": "PLUMB",
    "Infrastructure": "INFRA",
    "Classroom equipment": "INFRA",
    "Sanitation": "SANIT",
    "Internet connectivity": "IT",
    "Safety": "SAFETY",
    "Other": "GEN"
}

def auto_assign_complaint(
    db: Session,
    complaint: models.Complaint,
    ai_department_name: Optional[str] = None
) -> Tuple[Optional[models.Department], Optional[models.User]]:
    """
    Intelligently routes complaints to the responsible department and dispatches
    to the least-busy available technician in that department.
    """
    dept = None

    # 1. Match by department name if AI suggested one
    if ai_department_name:
        dept = db.query(models.Department).filter(models.Department.name.ilike(f"%{ai_department_name}%")).first()

    # 2. Match by category code mapping
    if not dept:
        code = DEPARTMENT_MAPPING.get(complaint.category, "GEN")
        dept = db.query(models.Department).filter(models.Department.code == code).first()

    if not dept:
        # Fallback to first available department
        dept = db.query(models.Department).first()

    if not dept:
        return None, None

    # 3. Find available maintenance staff in that department
    technicians = db.query(models.User).filter(
        models.User.role == "maintenance",
        models.User.department_id == dept.id
    ).all()

    assigned_tech = None
    if technicians:
        # Pick technician with fewest active assigned tasks
        tech_workloads = []
        for tech in technicians:
            active_tasks = db.query(models.Complaint).filter(
                models.Complaint.assigned_technician_id == tech.id,
                models.Complaint.status.in_(["Assigned", "In Progress", "Awaiting Verification"])
            ).count()
            tech_workloads.append((active_tasks, tech))

        tech_workloads.sort(key=lambda x: x[0])
        assigned_tech = tech_workloads[0][1]

    # Update department workload counter
    dept.active_workload = db.query(models.Complaint).filter(
        models.Complaint.department_id == dept.id,
        models.Complaint.status.in_(["Submitted", "AI Analysed", "Assigned", "In Progress"])
    ).count() + 1

    return dept, assigned_tech
