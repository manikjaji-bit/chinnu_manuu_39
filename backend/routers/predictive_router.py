from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from database import get_db
import models
from services.predictive_service import detect_recurring_problems, get_preventive_maintenance_forecast

router = APIRouter(prefix="/api/predictive", tags=["Predictive Intelligence"])

@router.get("/recurring-hotspots")
def get_recurring_hotspots(db: Session = Depends(get_db)):
    """
    FEATURE B: RECURRING PROBLEM DETECTOR
    Identifies locations with repeat complaints in short succession.
    """
    return detect_recurring_problems(db)


@router.get("/forecasts")
def get_forecasts(db: Session = Depends(get_db)):
    """
    Preventive maintenance forecasting per building.
    """
    return get_preventive_maintenance_forecast(db)


@router.get("/map-data")
def get_map_telemetry(db: Session = Depends(get_db)):
    """
    SMART CAMPUS MAP DATA:
    Returns buildings and complaints with geo-coordinates, severity markers, and status.
    """
    buildings = db.query(models.Building).all()
    complaints = db.query(models.Complaint).all()
    hotspots = detect_recurring_problems(db)

    building_list = []
    for b in buildings:
        active_c = [c for c in complaints if c.building_id == b.id and c.status != "Resolved"]
        critical_c = [c for c in active_c if c.severity in ["High", "Critical"]]
        
        building_list.append({
            "id": b.id,
            "name": b.name,
            "code": b.code,
            "latitude": b.latitude,
            "longitude": b.longitude,
            "floors": b.floors,
            "total_complaints": len([c for c in complaints if c.building_id == b.id]),
            "active_complaints": len(active_c),
            "critical_complaints": len(critical_c),
            "status_color": "#ef4444" if len(critical_c) > 0 else "#f59e0b" if len(active_c) > 2 else "#10b981"
        })

    complaint_markers = []
    for c in complaints:
        if c.latitude and c.longitude:
            complaint_markers.append({
                "id": c.id,
                "title": c.title,
                "category": c.category,
                "severity": c.severity,
                "priority_score": c.priority_score,
                "status": c.status,
                "building_id": c.building_id,
                "building_name": c.building.name if c.building else "",
                "floor": c.floor,
                "room": c.room,
                "latitude": c.latitude,
                "longitude": c.longitude,
                "image_url": c.image_url,
                "created_at": c.created_at.isoformat() if c.created_at else None
            })

    return {
        "campus_center": {"lat": 12.9723, "lng": 77.5945},
        "buildings": building_list,
        "complaint_markers": complaint_markers,
        "hotspots": hotspots
    }


@router.get("/trends")
def get_trend_analytics(db: Session = Depends(get_db)):
    """
    Analytical breakdowns for Recharts visualisations:
    - Complaints by category
    - Complaints by building
    - Status distribution
    - Monthly trend simulation
    """
    # 1. By Category
    cats = db.query(
        models.Complaint.category,
        func.count(models.Complaint.id).label("count")
    ).group_by(models.Complaint.category).all()

    # 2. By Building
    bldgs = db.query(
        models.Building.name,
        func.count(models.Complaint.id).label("count")
    ).join(models.Complaint, models.Complaint.building_id == models.Building.id)\
     .group_by(models.Building.name).all()

    # 3. By Severity
    sevs = db.query(
        models.Complaint.severity,
        func.count(models.Complaint.id).label("count")
    ).group_by(models.Complaint.severity).all()

    # 4. Monthly timeline simulation
    timeline = [
        {"month": "Jun", "complaints": 8, "resolved": 7, "avg_turnaround_hrs": 24},
        {"month": "Jul", "complaints": 12, "resolved": 11, "avg_turnaround_hrs": 21},
        {"month": "Aug", "complaints": 15, "resolved": 13, "avg_turnaround_hrs": 19},
        {"month": "Sep", "complaints": 22, "resolved": 18, "avg_turnaround_hrs": 17},
        {"month": "Oct", "complaints": 19, "resolved": 17, "avg_turnaround_hrs": 16},
        {"month": "Nov", "complaints": 16, "resolved": 12, "avg_turnaround_hrs": 14},
    ]

    return {
        "categories": [{"name": c[0], "value": c[1]} for c in cats],
        "buildings": [{"name": b[0], "value": b[1]} for b in bldgs],
        "severity": [{"name": s[0], "value": s[1]} for s in sevs],
        "timeline": timeline
    }
