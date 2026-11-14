from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

# User Schemas
class UserBase(BaseModel):
    email: str
    full_name: str
    role: str
    department_id: Optional[int] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    impact_score: int
    created_at: datetime

    class Config:
        from_attributes = True

# Department Schemas
class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    head_name: Optional[str] = None

class DepartmentResponse(DepartmentBase):
    id: int
    active_workload: int
    created_at: datetime

    class Config:
        from_attributes = True

# Building Schemas
class BuildingBase(BaseModel):
    name: str
    code: str
    latitude: float
    longitude: float
    floors: int

class BuildingResponse(BuildingBase):
    id: int
    total_complaints: int
    active_complaints: int
    health_score: Optional[int] = 85

    class Config:
        from_attributes = True

# AI Analysis Schemas
class AIAnalysisBase(BaseModel):
    detected_problem: str
    category: str
    severity: str
    priority_score: int
    safety_risk: bool
    description: str
    recommended_action: str
    assigned_department: str
    confidence: float = 0.92
    is_simulated: bool = False

class AIAnalysisResponse(AIAnalysisBase):
    id: int
    complaint_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Resolution Evidence Schemas
class ResolutionEvidenceCreate(BaseModel):
    after_image_url: str
    maintenance_notes: str
    work_duration_hours: float = 1.5
    parts_replaced: Optional[str] = None

class ResolutionEvidenceResponse(BaseModel):
    id: int
    complaint_id: int
    technician_id: int
    before_image_url: Optional[str] = None
    after_image_url: str
    maintenance_notes: str
    work_duration_hours: float
    parts_replaced: Optional[str] = None
    submitted_at: datetime

    class Config:
        from_attributes = True

# Verification Schemas
class VerificationResultResponse(BaseModel):
    id: int
    complaint_id: int
    verdict: str # Likely Resolved, Needs Human Review, Likely Unresolved
    similarity_score: float
    confidence: float
    notes: str
    verified_by_ai: bool
    approved_by_admin: Optional[bool] = None
    approved_by_student: Optional[bool] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Complaint Schemas
class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str
    building_id: int
    floor: str
    room: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None

class ComplaintUpdateStatus(BaseModel):
    status: str
    notes: Optional[str] = None

class ComplaintAssignRequest(BaseModel):
    department_id: Optional[int] = None
    assigned_technician_id: Optional[int] = None
    priority_score: Optional[int] = None

class ComplaintResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    building_id: int
    floor: str
    room: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    priority_score: int
    severity: str
    status: str
    student_id: int
    department_id: Optional[int] = None
    assigned_technician_id: Optional[int] = None
    is_duplicate: bool
    duplicate_of_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    building: Optional[BuildingResponse] = None
    student: Optional[UserResponse] = None
    department: Optional[DepartmentResponse] = None
    ai_analysis: Optional[AIAnalysisResponse] = None
    evidence: Optional[ResolutionEvidenceResponse] = None
    verification: Optional[VerificationResultResponse] = None

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    complaint_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str

# Assistant and Health Scores
class AssistantQueryRequest(BaseModel):
    query: str

class AssistantQueryResponse(BaseModel):
    query: str
    answer: str
    related_metrics: Optional[dict] = None
    action_items: Optional[List[str]] = None

class CampusHealthScore(BaseModel):
    score: int # 0-100
    status_label: str # Excellent, Good, Fair, Critical
    open_complaints_impact: float
    critical_incidents_impact: float
    resolution_time_impact: float
    recurring_problems_impact: float
    preventive_maintenance_impact: float
    total_open_complaints: int
    total_critical_incidents: int
    avg_resolution_hours: float
    recurring_hotspot_count: int
    calculation_summary: str
