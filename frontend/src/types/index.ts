export type UserRole = 'student' | 'maintenance' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: number | null;
  impact_score: number;
  avatar_url?: string | null;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  head_name?: string;
  active_workload: number;
  created_at: string;
}

export interface Building {
  id: number;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  floors: number;
  total_complaints: number;
  active_complaints: number;
  critical_complaints?: number;
  health_score?: number;
}

export type ComplaintSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplaintStatus =
  | 'Submitted'
  | 'AI Analysed'
  | 'Assigned'
  | 'In Progress'
  | 'Awaiting Verification'
  | 'Resolved'
  | 'Reopened';

export interface AIAnalysis {
  id: number;
  complaint_id: number;
  detected_problem: string;
  category: string;
  severity: ComplaintSeverity;
  priority_score: number;
  safety_risk: boolean;
  description: string;
  recommended_action: string;
  assigned_department: string;
  confidence: number;
  is_simulated: boolean;
  created_at: string;
}

export interface ResolutionEvidence {
  id: number;
  complaint_id: number;
  technician_id: number;
  before_image_url?: string | null;
  after_image_url: string;
  maintenance_notes: string;
  work_duration_hours: number;
  parts_replaced?: string | null;
  submitted_at: string;
}

export interface VerificationResult {
  id: number;
  complaint_id: number;
  verdict: 'Likely Resolved' | 'Needs Human Review' | 'Likely Unresolved';
  similarity_score: number;
  confidence: number;
  notes: string;
  verified_by_ai: boolean;
  approved_by_admin?: boolean | null;
  approved_by_student?: boolean | null;
  created_at: string;
}

export interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  building_id: number;
  floor: string;
  room: string;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
  video_url?: string | null;
  priority_score: number;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  student_id: number;
  department_id?: number | null;
  assigned_technician_id?: number | null;
  is_duplicate: boolean;
  duplicate_of_id?: number | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;

  building?: Building;
  student?: User;
  technician?: User;
  department?: Department;
  ai_analysis?: AIAnalysis;
  evidence?: ResolutionEvidence;
  verification?: VerificationResult;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'warning';
  complaint_id?: number | null;
  is_read: boolean;
  created_at: string;
}

export interface CampusHealthScore {
  score: number;
  status_label: string;
  open_complaints_impact: number;
  critical_incidents_impact: number;
  resolution_time_impact: number;
  recurring_problems_impact: number;
  preventive_maintenance_impact: number;
  total_open_complaints: number;
  total_critical_incidents: number;
  avg_resolution_hours: number;
  recurring_hotspot_count: number;
  calculation_summary: string;
}

export interface RecurringHotspot {
  building_id: number;
  building_name: string;
  room: string;
  category: string;
  complaint_count: number;
  urgency: string;
  insight: string;
  recommendation: string;
  latitude: number;
  longitude: number;
}

export interface ResourceSuggestion {
  department_id: number;
  department_name: string;
  open_tickets: number;
  critical_tickets: number;
  estimated_effort_hours: number;
  recommendation: string;
  urgency: string;
}
