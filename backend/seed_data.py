import datetime
from sqlalchemy.orm import Session
import models
from auth import hash_password

def seed_database(db: Session):
    """
    Seeds comprehensive realistic campus data if database is empty.
    Provides 15+ realistic complaints across varying categories and states,
    sample before/after evidence, recurring issue hotspots, and demo users.
    """
    if db.query(models.User).first():
        return # Database already populated

    print("[Seed Data] Populating realistic Smart Campus demo environment...")

    # 1. Create Departments
    departments = [
        models.Department(name="Electrical Department", code="ELEC", description="High & low voltage distribution, lighting, and power electronics", head_name="Marcus Vance", active_workload=4),
        models.Department(name="Plumbing Department", code="PLUMB", description="Potable water delivery, sewage, fixtures, and hydronics", head_name="Rajesh Patel", active_workload=3),
        models.Department(name="Infrastructure Department", code="INFRA", description="Structural integrity, masonry, furniture, and carpentry", head_name="Elena Rostova", active_workload=3),
        models.Department(name="Sanitation Department", code="SANIT", description="Waste segregation, pest control, and campus hygiene", head_name="Linda Gomez", active_workload=2),
        models.Department(name="IT & Network Department", code="IT", description="Campus fiber backbone, Wi-Fi 6 access points, and smart classroom AV", head_name="Sanjay Gupta", active_workload=2),
        models.Department(name="Campus Safety & Security", code="SAFETY", description="Fire suppression, emergency exits, access control, and CCTV", head_name="Chief Arthur Pendelton", active_workload=1),
    ]
    db.add_all(departments)
    db.commit()

    elec_dept = db.query(models.Department).filter_by(code="ELEC").first()
    plumb_dept = db.query(models.Department).filter_by(code="PLUMB").first()
    infra_dept = db.query(models.Department).filter_by(code="INFRA").first()
    it_dept = db.query(models.Department).filter_by(code="IT").first()

    # 2. Create Demo Users
    users = [
        models.User(
            email="student@campus.demo",
            hashed_password=hash_password("password123"),
            full_name="Alex Johnson",
            role="student",
            impact_score=195,
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        ),
        models.User(
            email="student2@campus.demo",
            hashed_password=hash_password("password123"),
            full_name="Maya Patel",
            role="student",
            impact_score=140,
            avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
        ),
        models.User(
            email="student3@campus.demo",
            hashed_password=hash_password("password123"),
            full_name="Liam Chen",
            role="student",
            impact_score=110,
            avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
        ),
        models.User(
            email="maintenance@campus.demo",
            hashed_password=hash_password("password123"),
            full_name="Carlos Rodriguez",
            role="maintenance",
            department_id=elec_dept.id,
            impact_score=350,
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
        ),
        models.User(
            email="plumber@campus.demo",
            hashed_password=hash_password("password123"),
            full_name="David Kim",
            role="maintenance",
            department_id=plumb_dept.id,
            impact_score=280,
            avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
        ),
        models.User(
            email="admin@campus.demo",
            hashed_password=hash_password("password123"),
            full_name="Dr. Eleanor Vance",
            role="admin",
            impact_score=500,
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
        ),
    ]
    db.add_all(users)
    db.commit()

    student_user = db.query(models.User).filter_by(email="student@campus.demo").first()
    maintenance_user = db.query(models.User).filter_by(email="maintenance@campus.demo").first()
    plumber_user = db.query(models.User).filter_by(email="plumber@campus.demo").first()
    admin_user = db.query(models.User).filter_by(email="admin@campus.demo").first()

    # 3. Create Campus Buildings
    buildings = [
        models.Building(name="Science Block A", code="SCI-A", latitude=12.9719, longitude=77.5937, floors=4, total_complaints=5, active_complaints=3),
        models.Building(name="Engineering Block B", code="ENG-B", latitude=12.9728, longitude=77.5952, floors=5, total_complaints=6, active_complaints=4),
        models.Building(name="Central Academic Library", code="LIB", latitude=12.9712, longitude=77.5941, floors=3, total_complaints=3, active_complaints=1),
        models.Building(name="Innovation & Tech Hub", code="TECH", latitude=12.9735, longitude=77.5960, floors=4, total_complaints=4, active_complaints=2),
        models.Building(name="Student Center & Dining", code="CAFE", latitude=12.9705, longitude=77.5925, floors=2, total_complaints=2, active_complaints=1),
        models.Building(name="University Hostel 3", code="HST-3", latitude=12.9742, longitude=77.5932, floors=6, total_complaints=4, active_complaints=2),
    ]
    db.add_all(buildings)
    db.commit()

    sci_bldg = db.query(models.Building).filter_by(code="SCI-A").first()
    eng_bldg = db.query(models.Building).filter_by(code="ENG-B").first()
    lib_bldg = db.query(models.Building).filter_by(code="LIB").first()
    tech_bldg = db.query(models.Building).filter_by(code="TECH").first()
    cafe_bldg = db.query(models.Building).filter_by(code="CAFE").first()
    hst_bldg = db.query(models.Building).filter_by(code="HST-3").first()

    now = datetime.datetime.utcnow()

    # 4. Realistic 15+ Complaints with AI Analyses and Evidence
    complaint_data = [
        # 1. Critical Water + Electric combo
        {
            "title": "Severe ceiling water leakage dripping onto breaker panel",
            "description": "Continuous water stream pouring directly over the 440V main sub-distribution board. Water pooling around live conduits.",
            "category": "Plumbing",
            "building_id": sci_bldg.id,
            "floor": "2nd Floor",
            "room": "Room 204 (Chemistry Lab)",
            "latitude": 12.97195,
            "longitude": 77.59372,
            "image_url": "https://images.unsplash.com/photo-1542013936693-884638332954?w=800&auto=format&fit=crop&q=80",
            "priority_score": 96,
            "severity": "Critical",
            "status": "In Progress",
            "department_id": plumb_dept.id,
            "assigned_technician_id": plumber_user.id,
            "ai_problem": "Ceiling Water Leak Ingress Over Live Electrical Distribution Board",
            "ai_action": "Isolate breaker circuit immediately to avert electrocution/fire. Shut off primary riser valve.",
            "safety_risk": True,
            "created_at": now - datetime.timedelta(hours=4)
        },
        # 2. Recurring electrical spark in Computer Lab 2
        {
            "title": "Violent electrical sparks from wall socket station",
            "description": "Socket emitted loud crackling and blue sparks when student plugged in laptop. Burn marks visible around socket frame.",
            "category": "Electrical",
            "building_id": eng_bldg.id,
            "floor": "3rd Floor",
            "room": "Computer Lab 2",
            "latitude": 12.97282,
            "longitude": 77.59524,
            "image_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
            "priority_score": 98,
            "severity": "Critical",
            "status": "Assigned",
            "department_id": elec_dept.id,
            "assigned_technician_id": maintenance_user.id,
            "ai_problem": "Phase-to-Neutral Arcing / Thermal Socket Degradation",
            "ai_action": "De-energize circuit loop 3B. Replace burnt receptacle with industrial grade GFCI unit.",
            "safety_risk": True,
            "created_at": now - datetime.timedelta(hours=2)
        },
        # 3. Recurring AC failure in same Computer Lab 2 (Detects hotspot!)
        {
            "title": "Air conditioning blower grinding noise and refrigerant smell",
            "description": "Ceiling cassette AC unit in Lab 2 is rattling loudly, blowing warm damp air with chemical odor. Fourth failure this month.",
            "category": "Classroom equipment",
            "building_id": eng_bldg.id,
            "floor": "3rd Floor",
            "room": "Computer Lab 2",
            "latitude": 12.97285,
            "longitude": 77.59528,
            "image_url": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
            "priority_score": 76,
            "severity": "High",
            "status": "In Progress",
            "department_id": infra_dept.id,
            "assigned_technician_id": maintenance_user.id,
            "ai_problem": "HVAC Compressor Bearing Failure & Freon Leak",
            "ai_action": "Evacuate refrigerant line, replace seized blower motor and inspect condensate drain.",
            "safety_risk": False,
            "created_at": now - datetime.timedelta(days=2)
        },
        # 4. Emergency fire door jammed
        {
            "title": "Emergency fire escape exit door jammed shut",
            "description": "Panic push bar does not retract the latch bolt. Door cannot be opened from the inside during fire evacuation drill.",
            "category": "Safety",
            "building_id": eng_bldg.id,
            "floor": "1st Floor",
            "room": "South Stairwell Exit",
            "latitude": 12.97275,
            "longitude": 77.59515,
            "image_url": "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=800&auto=format&fit=crop&q=80",
            "priority_score": 92,
            "severity": "Critical",
            "status": "Assigned",
            "department_id": infra_dept.id,
            "assigned_technician_id": maintenance_user.id,
            "ai_problem": "Emergency Egress Obstruction / Seized Panic Hardware",
            "ai_action": "Emergency lubricate and adjust panic crash bar mechanism. Replace worn strike plate immediately.",
            "safety_risk": True,
            "created_at": now - datetime.timedelta(hours=6)
        },
        # 5. Cracked glass railing in Library
        {
            "title": "Deep spiderweb fracture on 3rd floor atrium glass balustrade",
            "description": "Large impact crack expanding along structural glass balustrade overlooking ground floor central atrium.",
            "category": "Infrastructure",
            "building_id": lib_bldg.id,
            "floor": "3rd Floor",
            "room": "Central Atrium Gallery",
            "latitude": 12.97125,
            "longitude": 77.59412,
            "image_url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
            "priority_score": 84,
            "severity": "High",
            "status": "Awaiting Verification",
            "department_id": infra_dept.id,
            "assigned_technician_id": maintenance_user.id,
            "ai_problem": "Tempered Laminated Glass Structural Failure / Falling Hazard",
            "ai_action": "Erect barrier netting below. Install temporary stabilization clamp and replace 12mm glass panel.",
            "safety_risk": True,
            "created_at": now - datetime.timedelta(days=1)
        },
        # 6. Overflowing water cooler in Hostel 3
        {
            "title": "Flooding from burst line behind chilled water dispenser",
            "description": "Water overflowing from dispenser tray spreading across hostel corridor. Slippery standing water.",
            "category": "Water supply",
            "building_id": hst_bldg.id,
            "floor": "Ground Floor",
            "room": "Corridor West Wing",
            "latitude": 12.97422,
            "longitude": 77.59325,
            "image_url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
            "priority_score": 79,
            "severity": "High",
            "status": "Assigned",
            "department_id": plumb_dept.id,
            "assigned_technician_id": plumber_user.id,
            "ai_problem": "High-Pressure Inlet Hose Rupture & Hallway Inundation",
            "ai_action": "Shut off local angle stop valve, deploy wet vacuum, and fit braided stainless steel supply line.",
            "safety_risk": True,
            "created_at": now - datetime.timedelta(hours=8)
        },
        # 7. WiFi Access Point failure in Tech Hub
        {
            "title": "Aruba AP-555 flashing red LED, zero connectivity in seminar hall",
            "description": "All 80 students in robotics seminar disconnected simultaneously. PoE power cycle did not resolve.",
            "category": "Internet connectivity",
            "building_id": tech_bldg.id,
            "floor": "2nd Floor",
            "room": "Auditorium Theta",
            "latitude": 12.97352,
            "longitude": 77.59604,
            "image_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
            "priority_score": 62,
            "severity": "Medium",
            "status": "In Progress",
            "department_id": it_dept.id,
            "assigned_technician_id": maintenance_user.id,
            "ai_problem": "PoE Switchport Overcurrent / Firmware Crash",
            "ai_action": "Check upstream Cisco switchport PoE budget, reflash AP firmware via console port.",
            "safety_risk": False,
            "created_at": now - datetime.timedelta(hours=12)
        },
        # 8. Sanitation overflow near Science Cafeteria
        {
            "title": "Organic waste bin overflow with insect swarm",
            "description": "Multiple garbage cans overflowing with food containers behind cafeteria loading bay. Pungent odor entering classrooms.",
            "category": "Sanitation",
            "building_id": cafe_bldg.id,
            "floor": "Rear Yard",
            "room": "Service Dock B",
            "latitude": 12.97055,
            "longitude": 77.59258,
            "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80",
            "priority_score": 58,
            "severity": "Medium",
            "status": "Assigned",
            "department_id": db.query(models.Department).filter_by(code="SANIT").first().id,
            "assigned_technician_id": None,
            "ai_problem": "Refuse Accumulation / Vector Infestation Risk",
            "ai_action": "Deploy dump trailer for immediate evacuation, pressure wash area with enzyme neutralizer.",
            "safety_risk": False,
            "created_at": now - datetime.timedelta(hours=16)
        },
        # 9. Broken classroom desk in Science Block
        {
            "title": "Broken welded bracket on lecture hall bench",
            "description": "Support arm under wooden writing table snapped off, leaving exposed sharp steel edge.",
            "category": "Classroom equipment",
            "building_id": sci_bldg.id,
            "floor": "1st Floor",
            "room": "Room 102",
            "latitude": 12.97192,
            "longitude": 77.59368,
            "image_url": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80",
            "priority_score": 42,
            "severity": "Low",
            "status": "Submitted",
            "department_id": infra_dept.id,
            "assigned_technician_id": None,
            "ai_problem": "Fatigue Fracture of Mild Steel Bracket",
            "ai_action": "TIG weld bracket or replace desk segment with new modular assembly.",
            "safety_risk": False,
            "created_at": now - datetime.timedelta(days=1)
        },
        # 10. Resolved Example 1: Kitchen pipe burst
        {
            "title": "Main cold water supply flex hose rupture in dining hall scullery",
            "description": "Water spraying under high pressure across scullery wash basins. Fast shutoff executed.",
            "category": "Plumbing",
            "building_id": cafe_bldg.id,
            "floor": "Ground Floor",
            "room": "Main Kitchen Scullery",
            "latitude": 12.97048,
            "longitude": 77.59248,
            "image_url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
            "priority_score": 85,
            "severity": "High",
            "status": "Resolved",
            "department_id": plumb_dept.id,
            "assigned_technician_id": plumber_user.id,
            "ai_problem": "Burst 1-inch braided flex hose under wash basin",
            "ai_action": "Replaced flex hose with rigid brass copper connection and tested under 6 bar static pressure.",
            "safety_risk": True,
            "created_at": now - datetime.timedelta(days=4),
            "resolved_at": now - datetime.timedelta(days=3, hours=18),
            # Evidence
            "has_evidence": True,
            "after_image": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop&q=80",
            "notes": "Replaced ruptured flexible connector with heavy-duty schedule 40 brass piping. Hydrostatic test showed zero leaks. Area sanitized.",
            "parts": "1-inch Brass Union, Schedule 40 Copper Nipple, PTFE Seal Tape",
            "verdict": "Likely Resolved"
        },
        # 11. Resolved Example 2: Library reading lamps
        {
            "title": "Flickering high-bay ballast in quiet reading hall",
            "description": "Buzzing hum and intermittent strobe effect causing severe eye strain to students preparing for exams.",
            "category": "Electrical",
            "building_id": lib_bldg.id,
            "floor": "2nd Floor",
            "room": "Periodicals Reading Room",
            "latitude": 12.97122,
            "longitude": 77.59405,
            "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
            "priority_score": 38,
            "severity": "Low",
            "status": "Resolved",
            "department_id": elec_dept.id,
            "assigned_technician_id": maintenance_user.id,
            "ai_problem": "Failing Electronic Fluorescent Ballast (Magnetic Hum)",
            "ai_action": "Bypassed ballast and retrofitted with 5000K flicker-free LED T8 tubes.",
            "safety_risk": False,
            "created_at": now - datetime.timedelta(days=5),
            "resolved_at": now - datetime.timedelta(days=5, hours=2),
            "has_evidence": True,
            "after_image": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop&q=80",
            "notes": "Replaced ballast with solid-state driver. Measured luminance: 520 Lux uniform. No visible flicker.",
            "parts": "Osram 22W LED Drivers, Philips CorePro LED Tubes",
            "verdict": "Likely Resolved"
        },
        # 12. In Progress: Server room UPS alarm in Tech Hub
        {
            "title": "UPS battery bank high temperature alert (48°C) in server room",
            "description": "Smart sensor triggering continuous audible siren. Red thermal fault LED active on APC Symmetra rack.",
            "category": "Electrical",
            "building_id": tech_bldg.id,
            "floor": "Basement",
            "room": "Server Annex B-04",
            "latitude": 12.97345,
            "longitude": 77.59610,
            "priority_score": 90,
            "severity": "Critical",
            "status": "In Progress",
            "department_id": elec_dept.id,
            "assigned_technician_id": maintenance_user.id,
            "ai_problem": "Thermal Runaway Hazard in Lead-Acid Battery Strings",
            "ai_action": "Engage auxiliary cooling split unit. Isolate degraded battery string #4 immediately.",
            "safety_risk": True,
            "created_at": now - datetime.timedelta(hours=3)
        },
        # 13. Awaiting verification: Science Block B ceiling repair
        {
            "title": "Damp drywall plaster detachment in lecture hall 301",
            "description": "Chunks of plasterboard falling onto rear seating rows following heavy overnight rain.",
            "category": "Infrastructure",
            "building_id": sci_bldg.id,
            "floor": "3rd Floor",
            "room": "Lecture Hall 301",
            "latitude": 12.97198,
            "longitude": 77.59379,
            "priority_score": 75,
            "severity": "High",
            "status": "Awaiting Verification",
            "department_id": infra_dept.id,
            "assigned_technician_id": maintenance_user.id,
            "ai_problem": "Water-Degraded Gypsum Board Spalling",
            "ai_action": "Removed damaged panels, sealed rooftop flashing, installed moisture-resistant gypsum.",
            "safety_risk": True,
            "created_at": now - datetime.timedelta(days=2),
            "has_evidence": True,
            "after_image": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80",
            "notes": "Scraped loose plaster, applied waterproof epoxy sealant on exterior slab and replaced 4 ceiling tiles.",
            "parts": "Armstrong RH99 Ceiling Tiles, Sika Waterbar",
            "verdict": "Needs Human Review"
        },
        # 14. Low priority: Loose whiteboard in Hostel Study Room
        {
            "title": "Magnetic whiteboard loose from bottom anchor bolts",
            "description": "Whiteboard wobbles and slides down when writing on right quadrant.",
            "category": "Classroom equipment",
            "building_id": hst_bldg.id,
            "floor": "2nd Floor",
            "room": "Common Study Hall",
            "latitude": 12.97425,
            "longitude": 77.59330,
            "priority_score": 28,
            "severity": "Low",
            "status": "Submitted",
            "department_id": infra_dept.id,
            "assigned_technician_id": None,
            "ai_problem": "Stripped Wall Anchor Fasteners in Masonry",
            "ai_action": "Re-drill holes, install 8mm Fischer wall plugs and tighten heavy-duty mounting brackets.",
            "safety_risk": False,
            "created_at": now - datetime.timedelta(days=3)
        },
        # 15. Resolved: Block B Water Pressure Regulator
        {
            "title": "Low water pressure in 4th and 5th floor restrooms",
            "description": "Zero water flow during peak morning hours. Booster pump tripping thermal overload relay.",
            "category": "Plumbing",
            "building_id": eng_bldg.id,
            "floor": "5th Floor",
            "room": "Restroom Core North",
            "latitude": 12.97290,
            "longitude": 77.59535,
            "priority_score": 68,
            "severity": "Medium",
            "status": "Resolved",
            "department_id": plumb_dept.id,
            "assigned_technician_id": plumber_user.id,
            "ai_problem": "Cavitation & Pressure Regulator Valve Diaphragm Tear",
            "ai_action": "Replaced pressure regulator valve diaphragm and balanced hydronic delivery loop.",
            "safety_risk": False,
            "created_at": now - datetime.timedelta(days=6),
            "resolved_at": now - datetime.timedelta(days=5, hours=10),
            "has_evidence": True,
            "after_image": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
            "notes": "Fitted new Watts 1.5-inch PRV. Calibrated static delivery pressure to 3.2 bar across 5th floor risers.",
            "parts": "Watts PRV Diaphragm Kit, Pressure Gauge 0-10 bar",
            "verdict": "Likely Resolved"
        }
    ]

    for item in complaint_data:
        complaint = models.Complaint(
            title=item["title"],
            description=item["description"],
            category=item["category"],
            building_id=item["building_id"],
            floor=item["floor"],
            room=item["room"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            image_url=item.get("image_url"),
            priority_score=item["priority_score"],
            severity=item["severity"],
            status=item["status"],
            student_id=student_user.id,
            department_id=item.get("department_id"),
            assigned_technician_id=item.get("assigned_technician_id"),
            created_at=item["created_at"],
            resolved_at=item.get("resolved_at")
        )
        db.add(complaint)
        db.commit()
        db.refresh(complaint)

        # AI Analysis Record
        ai_rec = models.AIAnalysis(
            complaint_id=complaint.id,
            detected_problem=item["ai_problem"],
            category=item["category"],
            severity=item["severity"],
            priority_score=item["priority_score"],
            safety_risk=item["safety_risk"],
            description=f"AI Diagnostic Model v4 detected {item['ai_problem']}. Calibrated risk metric: {item['priority_score']}/100.",
            recommended_action=item["ai_action"],
            assigned_department=db.query(models.Department).get(item["department_id"]).name if item.get("department_id") else "General Maintenance",
            confidence=0.94,
            is_simulated=True,
            created_at=item["created_at"]
        )
        db.add(ai_rec)

        # Resolution Evidence if resolved
        if item.get("has_evidence"):
            ev = models.ResolutionEvidence(
                complaint_id=complaint.id,
                technician_id=item.get("assigned_technician_id", maintenance_user.id),
                before_image_url=item.get("image_url"),
                after_image_url=item.get("after_image"),
                maintenance_notes=item.get("notes"),
                work_duration_hours=2.0,
                parts_replaced=item.get("parts"),
                submitted_at=item.get("resolved_at") or now
            )
            db.add(ev)

            ver = models.VerificationResult(
                complaint_id=complaint.id,
                verdict=item.get("verdict", "Likely Resolved"),
                similarity_score=0.92,
                confidence=0.95,
                notes=f"AI Vision Model confirmed complete visible remediation: {item.get('notes')}",
                verified_by_ai=True,
                approved_by_admin=True if item["status"] == "Resolved" else None,
                approved_by_student=True if item["status"] == "Resolved" else None,
                created_at=item.get("resolved_at") or now
            )
            db.add(ver)

    db.commit()

    # 5. Seed Initial Notifications
    notifications = [
        models.Notification(
            user_id=student_user.id,
            title="AI Analysis Complete",
            message="Your report regarding 'Severe ceiling water leakage' was analyzed. Assigned Priority 96/100 (Critical).",
            type="alert",
            complaint_id=1,
            is_read=False,
            created_at=now - datetime.timedelta(hours=3, minutes=50)
        ),
        models.Notification(
            user_id=student_user.id,
            title="Complaint Status Update: In Progress",
            message="Technician David Kim has accepted your ticket and is on site at Science Block A.",
            type="info",
            complaint_id=1,
            is_read=False,
            created_at=now - datetime.timedelta(hours=2)
        ),
        models.Notification(
            user_id=admin_user.id,
            title="CRITICAL SAFETY ESCALATION",
            message="Water ingress near live 440V panel in Science Block A (Room 204). Emergency response team dispatched.",
            type="alert",
            complaint_id=1,
            is_read=False,
            created_at=now - datetime.timedelta(hours=3, minutes=45)
        ),
        models.Notification(
            user_id=maintenance_user.id,
            title="Emergency Task Assigned",
            message="New Critical Electrical ticket: Sparks in Computer Lab 2. Priority: 98/100.",
            type="alert",
            complaint_id=2,
            is_read=False,
            created_at=now - datetime.timedelta(hours=1, minutes=50)
        )
    ]
    db.add_all(notifications)

    # 6. Seed Student Gamification Points
    points = [
        models.StudentPoints(student_id=student_user.id, complaint_id=1, points=50, reason="High-severity genuine safety issue detected"),
        models.StudentPoints(student_id=student_user.id, complaint_id=2, points=45, reason="Valuable photographic evidence submitted"),
        models.StudentPoints(student_id=student_user.id, complaint_id=10, points=30, reason="Confirmed resolution of kitchen plumbing repair"),
        models.StudentPoints(student_id=student_user.id, complaint_id=11, points=20, reason="Reported low-frequency electrical ballast failure"),
        models.StudentPoints(student_id=student_user.id, points=50, reason="Campus Guardian Onboarding & Top Scout Badge")
    ]
    db.add_all(points)

    # 7. Seed Audit Activity Logs
    logs = [
        models.ActivityLog(user_name="System AI", action="AUTO_ROUTING", details="Complaint #1 routed to Plumbing Dept based on water/fixture severity classification."),
        models.ActivityLog(user_name="System AI", action="CRITICAL_ESCALATION", details="Priority 96 triggered automatic push to Dr. Eleanor Vance (Chief Administrator)."),
        models.ActivityLog(user_name="Carlos Rodriguez", action="TASK_ACCEPTED", details="Technician accepted Work Order #2: Arcing wall socket in Eng Block B."),
        models.ActivityLog(user_name="David Kim", action="EVIDENCE_SUBMITTED", details="Submitted after-repair photograph and brass pipe union parts list for Complaint #10."),
        models.ActivityLog(user_name="Dr. Eleanor Vance", action="RESOLUTION_VERIFIED", details="Approved resolution verification for Kitchen Scullery burst pipe (#10).")
    ]
    db.add_all(logs)

    db.commit()
    print("[Seed Data] Smart Campus database successfully populated with 15+ comprehensive records.")
