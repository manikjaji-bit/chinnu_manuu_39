import os
import shutil
import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from auth import get_current_user
from services.ai_service import analyze_complaint_image
from services.routing_service import auto_assign_complaint
from services.verification_service import verify_resolution
from services.predictive_service import check_for_duplicates
from services.notification_service import create_notification, notify_admins, log_activity

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...)):
    """
    Saves an uploaded photo to the local uploads directory and returns its accessible URL.
    """
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"url": f"/uploads/{filename}", "filename": filename}


@router.post("/submit", response_model=schemas.ComplaintResponse)
async def submit_complaint(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    building_id: int = Form(...),
    floor: str = Form(...),
    room: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    image_url: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Submits a complaint, conducts AI Vision diagnostic scan, checks for duplicates,
    performs automated routing, and awards student gamification points.
    """
    # 1. Process Image
    final_image_url = image_url
    image_bytes = None

    if image_file and image_file.filename:
        image_bytes = await image_file.read()
        ext = os.path.splitext(image_file.filename)[1] or ".jpg"
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(image_bytes)
        final_image_url = f"/uploads/{filename}"

    # 2. Check Building & Duplicate Detection (FEATURE D)
    building = db.query(models.Building).filter(models.Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Selected campus building not found")

    existing_dup = check_for_duplicates(db, building_id, room, category)
    is_duplicate = existing_dup is not None
    duplicate_of_id = existing_dup.id if existing_dup else None

    # Check if recurring problem zone
    past_in_room = db.query(models.Complaint).filter(
        models.Complaint.building_id == building_id,
        models.Complaint.room.ilike(room.strip())
    ).count()
    is_recurring = past_in_room >= 2

    # 3. AI Vision & Diagnostic Analysis
    ai_result = analyze_complaint_image(
        image_bytes=image_bytes,
        title=title,
        description=description,
        category=category,
        building_name=building.name,
        room=room,
        is_recurring=is_recurring
    )

    priority_score = ai_result["priority_score"]
    severity = ai_result["severity"]

    # 4. Construct Complaint
    complaint = models.Complaint(
        title=title,
        description=description,
        category=category,
        building_id=building_id,
        floor=floor,
        room=room,
        latitude=latitude or building.latitude,
        longitude=longitude or building.longitude,
        image_url=final_image_url,
        priority_score=priority_score,
        severity=severity,
        status="AI Analysed",
        student_id=current_user.id,
        is_duplicate=is_duplicate,
        duplicate_of_id=duplicate_of_id
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # 5. Persist AI Analysis
    ai_record = models.AIAnalysis(
        complaint_id=complaint.id,
        detected_problem=ai_result["detected_problem"],
        category=ai_result["category"],
        severity=ai_result["severity"],
        priority_score=ai_result["priority_score"],
        safety_risk=ai_result["safety_risk"],
        description=ai_result["description"],
        recommended_action=ai_result["recommended_action"],
        assigned_department=ai_result["assigned_department"],
        confidence=ai_result.get("confidence", 0.94),
        is_simulated=ai_result.get("is_simulated", False)
    )
    db.add(ai_record)

    # 6. Automatic Intelligent Assignment (FEATURE 6)
    dept, assigned_tech = auto_assign_complaint(db, complaint, ai_result.get("assigned_department"))
    if dept:
        complaint.department_id = dept.id
        complaint.assigned_technician_id = assigned_tech.id if assigned_tech else None
        complaint.status = "Assigned"

    db.commit()
    db.refresh(complaint)

    # 7. Student Gamification (Impact Score points)
    if not is_duplicate:
        points_earned = 25 if severity in ["High", "Critical"] else 15
        current_user.impact_score = (current_user.impact_score or 0) + points_earned
        pt_entry = models.StudentPoints(
            student_id=current_user.id,
            complaint_id=complaint.id,
            points=points_earned,
            reason=f"Reported {severity.lower()} {category.lower()} issue (+{points_earned} pts)"
        )
        db.add(pt_entry)

    # 8. Notifications & Audit Logs
    create_notification(
        db,
        user_id=current_user.id,
        title="Complaint Submitted & AI Analysed",
        message=f"Report #{complaint.id} received. Priority assessed at {priority_score}/100. Dispatched to {dept.name if dept else 'Maintenance'}.",
        type="success" if not is_duplicate else "warning",
        complaint_id=complaint.id
    )

    if assigned_tech:
        create_notification(
            db,
            user_id=assigned_tech.id,
            title="New Work Order Dispatched",
            message=f"Priority {priority_score}/100 task: {title} in {building.name} {room}.",
            type="alert" if priority_score >= 80 else "info",
            complaint_id=complaint.id
        )

    if severity == "Critical" or priority_score >= 85:
        notify_admins(
            db,
            title="CRITICAL INCIDENT ALERT",
            message=f"Critical hazard #{complaint.id} ({title}) reported in {building.name} {room}. Priority: {priority_score}/100.",
            type="alert",
            complaint_id=complaint.id
        )

    log_activity(
        db,
        action="COMPLAINT_FILED",
        details=f"Complaint #{complaint.id} ({title}) submitted by {current_user.full_name}. Priority: {priority_score}/100.",
        user_id=current_user.id,
        user_name=current_user.full_name
    )

    return complaint


@router.get("/", response_model=List[schemas.ComplaintResponse])
def get_complaints(
    status: Optional[str] = None,
    category: Optional[str] = None,
    building_id: Optional[int] = None,
    department_id: Optional[int] = None,
    severity: Optional[str] = None,
    mine_only: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Complaint)

    if mine_only or (current_user.role == "student" and mine_only):
        query = query.filter(models.Complaint.student_id == current_user.id)
    if status:
        query = query.filter(models.Complaint.status == status)
    if category:
        query = query.filter(models.Complaint.category == category)
    if building_id:
        query = query.filter(models.Complaint.building_id == building_id)
    if department_id:
        query = query.filter(models.Complaint.department_id == department_id)
    if severity:
        query = query.filter(models.Complaint.severity == severity)

    return query.order_by(models.Complaint.priority_score.desc(), models.Complaint.id.desc()).all()


@router.get("/{complaint_id}", response_model=schemas.ComplaintResponse)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint record not found")
    return complaint


@router.patch("/{complaint_id}/status", response_model=schemas.ComplaintResponse)
def update_complaint_status(
    complaint_id: int,
    payload: schemas.ComplaintUpdateStatus,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    old_status = complaint.status
    complaint.status = payload.status
    complaint.updated_at = datetime.datetime.utcnow()

    if payload.status == "Resolved":
        complaint.resolved_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(complaint)

    # Notify student
    create_notification(
        db,
        user_id=complaint.student_id,
        title=f"Complaint Status: {payload.status}",
        message=f"Work order #{complaint.id} changed from '{old_status}' to '{payload.status}'. {payload.notes or ''}",
        type="info",
        complaint_id=complaint.id
    )

    log_activity(
        db,
        action="STATUS_CHANGED",
        details=f"Complaint #{complaint.id} status changed from {old_status} to {payload.status} by {current_user.full_name}.",
        user_id=current_user.id,
        user_name=current_user.full_name
    )

    return complaint


@router.post("/{complaint_id}/upload-evidence", response_model=schemas.ComplaintResponse)
def submit_resolution_evidence(
    complaint_id: int,
    payload: schemas.ResolutionEvidenceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Maintenance submits completion evidence (after image + repair notes).
    Triggers AI Resolution Verification System.
    """
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Record or update evidence
    evidence = db.query(models.ResolutionEvidence).filter(models.ResolutionEvidence.complaint_id == complaint.id).first()
    if not evidence:
        evidence = models.ResolutionEvidence(
            complaint_id=complaint.id,
            technician_id=current_user.id,
            before_image_url=complaint.image_url,
            after_image_url=payload.after_image_url,
            maintenance_notes=payload.maintenance_notes,
            work_duration_hours=payload.work_duration_hours,
            parts_replaced=payload.parts_replaced
        )
        db.add(evidence)
    else:
        evidence.after_image_url = payload.after_image_url
        evidence.maintenance_notes = payload.maintenance_notes
        evidence.work_duration_hours = payload.work_duration_hours
        evidence.parts_replaced = payload.parts_replaced

    # Run AI Resolution Verification
    verification = verify_resolution(
        complaint=complaint,
        before_image_url=complaint.image_url,
        after_image_url=payload.after_image_url,
        maintenance_notes=payload.maintenance_notes,
        parts_replaced=payload.parts_replaced
    )

    # Persist or update verification result
    ver_record = db.query(models.VerificationResult).filter(models.VerificationResult.complaint_id == complaint.id).first()
    if not ver_record:
        ver_record = models.VerificationResult(
            complaint_id=complaint.id,
            verdict=verification["verdict"],
            similarity_score=verification["similarity_score"],
            confidence=verification["confidence"],
            notes=verification["notes"],
            verified_by_ai=True
        )
        db.add(ver_record)
    else:
        ver_record.verdict = verification["verdict"]
        ver_record.similarity_score = verification["similarity_score"]
        ver_record.confidence = verification["confidence"]
        ver_record.notes = verification["notes"]

    # Status update: If verification says Likely Resolved and not safety-critical, mark resolved; else Awaiting Verification
    if verification["verdict"] == "Likely Resolved" and complaint.severity != "Critical":
        complaint.status = "Resolved"
        complaint.resolved_at = datetime.datetime.utcnow()
    else:
        complaint.status = "Awaiting Verification"

    db.commit()
    db.refresh(complaint)

    # Notify student and admins
    create_notification(
        db,
        user_id=complaint.student_id,
        title="Resolution Evidence Submitted",
        message=f"Technician submitted repair evidence for #{complaint.id}. AI Verdict: {verification['verdict']}. Please review and confirm.",
        type="success" if verification["verdict"] == "Likely Resolved" else "warning",
        complaint_id=complaint.id
    )

    notify_admins(
        db,
        title="Resolution Verification Ready",
        message=f"Complaint #{complaint.id} repair evidence ready. AI Verdict: {verification['verdict']} ({int(verification['similarity_score']*100)}% remediation confidence).",
        type="info",
        complaint_id=complaint.id
    )

    return complaint


@router.post("/{complaint_id}/verify-signoff", response_model=schemas.ComplaintResponse)
def verify_signoff(
    complaint_id: int,
    approved: bool,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Student or Administrator confirms resolution or reopens the ticket.
    """
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    ver_record = db.query(models.VerificationResult).filter(models.VerificationResult.complaint_id == complaint.id).first()
    if not ver_record:
        raise HTTPException(status_code=400, detail="No verification evidence recorded for this ticket")

    if current_user.role == "admin":
        ver_record.approved_by_admin = approved
    else:
        ver_record.approved_by_student = approved

    if approved:
        complaint.status = "Resolved"
        complaint.resolved_at = datetime.datetime.utcnow()
        # Award student extra impact points for confirming
        current_user.impact_score = (current_user.impact_score or 0) + 15
        db.add(models.StudentPoints(
            student_id=current_user.id,
            complaint_id=complaint.id,
            points=15,
            reason="Confirmed resolution verification (+15 pts)"
        ))
    else:
        complaint.status = "Reopened"
        # Escalate priority
        complaint.priority_score = min(100, complaint.priority_score + 10)

    db.commit()
    db.refresh(complaint)

    log_activity(
        db,
        action="RESOLUTION_SIGNOFF",
        details=f"Verification for #{complaint.id} was {'APPROVED' if approved else 'REOPENED'} by {current_user.full_name}. Notes: {notes or 'None'}",
        user_id=current_user.id,
        user_name=current_user.full_name
    )

    return complaint
