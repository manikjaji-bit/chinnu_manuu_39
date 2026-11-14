import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False) # student, maintenance, admin
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    impact_score = Column(Integer, default=50) # Gamification points
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    department = relationship("Department", back_populates="members")
    complaints_filed = relationship("Complaint", foreign_keys="Complaint.student_id", back_populates="student")
    complaints_assigned = relationship("Complaint", foreign_keys="Complaint.assigned_technician_id", back_populates="technician")
    notifications = relationship("Notification", back_populates="user")
    points_history = relationship("StudentPoints", back_populates="student")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    head_name = Column(String(100), nullable=True)
    active_workload = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    members = relationship("User", back_populates="department")
    complaints = relationship("Complaint", back_populates="department")


class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    floors = Column(Integer, default=4)
    total_complaints = Column(Integer, default=0)
    active_complaints = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaints = relationship("Complaint", back_populates="building")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False) # Electrical, Plumbing, Infrastructure, Sanitation, Classroom equipment, Water supply, Safety, Internet connectivity, Other
    
    building_id = Column(Integer, ForeignKey("buildings.id"), nullable=False)
    floor = Column(String(50), nullable=False)
    room = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)

    priority_score = Column(Integer, default=50) # 0 to 100
    severity = Column(String(50), default="Medium") # Low, Medium, High, Critical
    status = Column(String(50), default="Submitted") # Submitted, AI Analysed, Assigned, In Progress, Awaiting Verification, Resolved, Reopened

    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    assigned_technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(Integer, ForeignKey("complaints.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    building = relationship("Building", back_populates="complaints")
    student = relationship("User", foreign_keys=[student_id], back_populates="complaints_filed")
    department = relationship("Department", back_populates="complaints")
    technician = relationship("User", foreign_keys=[assigned_technician_id], back_populates="complaints_assigned")
    ai_analysis = relationship("AIAnalysis", back_populates="complaint", uselist=False)
    evidence = relationship("ResolutionEvidence", back_populates="complaint", uselist=False)
    verification = relationship("VerificationResult", back_populates="complaint", uselist=False)


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), unique=True, nullable=False)
    detected_problem = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)
    priority_score = Column(Integer, nullable=False)
    safety_risk = Column(Boolean, default=False)
    description = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    assigned_department = Column(String(100), nullable=False)
    confidence = Column(Float, default=0.92)
    is_simulated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaint = relationship("Complaint", back_populates="ai_analysis")


class ResolutionEvidence(Base):
    __tablename__ = "resolution_evidence"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), unique=True, nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    before_image_url = Column(String(500), nullable=True)
    after_image_url = Column(String(500), nullable=False)
    maintenance_notes = Column(Text, nullable=False)
    work_duration_hours = Column(Float, default=1.5)
    parts_replaced = Column(String(255), nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaint = relationship("Complaint", back_populates="evidence")
    technician = relationship("User")


class VerificationResult(Base):
    __tablename__ = "verification_results"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), unique=True, nullable=False)
    verdict = Column(String(50), nullable=False) # Likely Resolved, Needs Human Review, Likely Unresolved
    similarity_score = Column(Float, default=0.88)
    confidence = Column(Float, default=0.91)
    notes = Column(Text, nullable=False)
    verified_by_ai = Column(Boolean, default=True)
    approved_by_admin = Column(Boolean, nullable=True) # True=Approved, False=Rejected/Reopened, None=Pending
    approved_by_student = Column(Boolean, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    complaint = relationship("Complaint", back_populates="verification")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info") # info, alert, success, warning
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")
    complaint = relationship("Complaint")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_name = Column(String(255), default="System")
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class StudentPoints(Base):
    __tablename__ = "student_points"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=True)
    points = Column(Integer, default=10)
    reason = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("User", back_populates="points_history")
