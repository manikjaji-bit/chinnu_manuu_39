# CAMPUS GUARDIAN
### The Self-Healing AI-Powered Smart Campus Ecosystem
> **Tagline:** *"Detect Problems Before They Become Disasters."*

---

## 🌟 Executive Summary

**Campus Guardian** transforms a traditional college campus into an intelligent, self-monitoring, and self-healing infrastructure ecosystem. Traditional campus complaint systems are passive: administrators wait for angry students to report failures after classrooms are already flooded, circuits are fried, or injuries have occurred.

Campus Guardian replaces this outdated model with **predictive, evidence-based infrastructure management**:
1. **AI Vision Diagnostic Scan**: Analyzes photos in real-time, estimates severity (0-100), isolates safety hazards, and prescribes immediate remediation.
2. **Automated Auto-Routing & Dispatch**: Intelligently routes tickets to responsible departments (Electrical, Plumbing, Infrastructure, IT, Sanitation) and balances technician queues.
3. **Standout Resolution Verification**: Compares **before-and-after photographic evidence** with AI vision to verify whether defects were genuinely remediated before closing.
4. **Predictive Maintenance & Recurring Failure Detector**: Identifies chronic breakdown hotspots (e.g. *"Computer Lab 2 has reported 4 AC failures in 20 days"*) to trigger preventive overhauls.
5. **Dynamic Campus Health Score (0-100)**: Transparent algorithmic index reflecting live infrastructure stability.
6. **Campus AI Maintenance Assistant**: Natural language executive copilot that queries live database records.

---

## 🏗️ Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAMPUS GUARDIAN ARCHITECTURE                    │
└────────────────────────────────────────────────────────────────────────┘

    FRONTEND (React + Vite + TypeScript)
    ├── Dark Navy & Electric Cyan Glassmorphism UI (Tailwind CSS)
    ├── Multi-Persona Dashboard (Student, Maintenance Staff, Administrator)
    ├── Interactive Smart Campus Map (Leaflet / OpenStreetMap GIS)
    ├── Real-Time Priority Gauges & Predictive Charts (Recharts)
    └── Resolution Proof Comparative Slider & Confetti Gamification
                                   │  HTTP / REST
                                   ▼
    BACKEND (FastAPI + Python 3.13)
    ├── REST API Routers (/api/auth, /api/complaints, /api/admin, /api/ai)
    ├── AI Diagnostic & Vision Engine (Gemini API + Deterministic Fallback)
    ├── Intelligent Auto-Routing & Workload Balancer
    ├── Comparative AI Resolution Verification Service
    ├── Predictive Hotspot & Preventive Maintenance Forecaster
    └── Audit Activity Ledger & Notification Engine
                                   │
                                   ▼
    DATA LAYER (SQLAlchemy + SQLite / PostgreSQL / Supabase)
    ├── Tables: users, departments, buildings, complaints, ai_analyses,
    │           resolution_evidence, verification_results, notifications,
    │           activity_logs, student_points
    └── Preloaded Seed Data (15+ realistic incidents across 6 campus facilities)
```

### Technology Matrix
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts, Leaflet / OpenStreetMap.
- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy.
- **Database**: SQLite (default zero-friction local mode) / PostgreSQL / Supabase.
- **AI/Vision**: Google Gemini Vision API with robust deterministic heuristic fallback for offline/demo reliability.

---

## ⚡ Quick Start Guide (Run in 30 Seconds)

### Option 1: One-Click Unified Server (Recommended)
FastAPI serves both the backend REST APIs and the built production React SPA directly on port 8000:

```powershell
python run_app.py
```
Or double-click `run_app.bat`.

Then open your browser at:
👉 **`http://localhost:8000`**

### Option 2: Dual Hot-Reload Development Mode
If editing frontend code live with instant HMR:

```powershell
.\run_dev.bat
```
- Frontend Dev Server: `http://localhost:5173`
- Backend API & Swagger: `http://localhost:8000/docs`

---

## 🎭 The Three User Personas & Demo Accounts

Campus Guardian features an **instant 1-click persona switcher** in the top navigation bar. Judges can test all three roles without typing credentials:

| Persona | Demo Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **🎓 Student** | `student@campus.demo` | `password123` | Report problems with photos, pre-scan with Vision AI, track repair timeline, view Student Impact Score leaderboard |
| **🛠️ Maintenance** | `maintenance@campus.demo` | `password123` | Kanban board (Assigned, In Progress, Verification, Resolved), accept tasks, submit before/after repair evidence |
| **🛡️ Administrator** | `admin@campus.demo` | `password123` | Executive Campus Health Score, recurring hotspot detector, override routing, query AI Assistant, export audit reports |

---

## 🚀 Standout Hackathon Features

### 1. Dynamic Campus Health Score (0 - 100)
A dynamic, algorithmic health index reflecting campus infrastructure safety:
$$\text{Health Score} = 100 - (\text{Open Issues} \times 1.0) - (\text{Critical Incidents} \times 3.5) - (\text{Resolution Lag} \times 0.2) - (\text{Recurring Hotspots} \times 3.0) + \text{Prevention Bonus}$$
Clicking the info icon on the dashboard opens a modal with the transparent mathematical calculation.

### 2. Standout Resolution Verification System
When maintenance completes a job:
- Technician uploads an **after-repair photograph**, logs parts replaced, and notes.
- AI Vision compares the original reported incident with the completed work.
- Generates a visual remediation verdict:
  - **Likely Resolved** (Remediation confirmed)
  - **Needs Human Review** (Inconclusive or safety-critical incident requiring human signoff)
  - **Likely Unresolved** (Defect still visible)
- Students or administrators can inspect the side-by-side evidence and click **Approve & Close** or **Reopen**.

### 3. Chronic Recurring Problem Detector
Identifies chronic breakdown zones where multiple incidents occur in the same room or facility:
> *"Engineering Block B - Computer Lab 2 has registered 2 recurring issues recently (Electrical). Action: Perform root-cause structural audit of electrical assets in Computer Lab 2. Schedule preventative replacement."*

### 4. AI Maintenance Copilot (Interactive Natural Language Q&A)
Administrators can ask natural language questions answered using **live database context**:
- *"Which building has the most problems?"*
- *"Which department has the highest pending workload?"*
- *"What are the most recurring complaints?"*
- *"Which issues require immediate attention?"*
- *"What preventive maintenance should be scheduled?"*

### 5. Duplicate Complaint Detection
When students report an issue in the same room and category that is already being handled, the system links it (`is_duplicate: true`) to avoid flooding technicians with redundant tickets.

### 6. Student Impact Score & Gamification
Students earn impact points:
- **+25 pts** for genuine safety hazards (water near electrics, structural cracks)
- **+15 pts** for confirming repair resolution signoffs
- **0 pts** for duplicate reports (prevents fraudulent spam)
- Ranks students from *Scout* to *Sentinel*, *Guardian*, and *Campus Champion*!

### 7. Smart Geospatial Campus Map
Interactive OpenStreetMap view rendered with Leaflet:
- Pulse markers for critical hazards
- Building cluster overlays with live active count tooltips
- Filter pills: All, Critical Incidents, Active Tickets, Recurring Hotspots, Resolved

---

## 🔒 Security & Data Integrity
- Role-based access control (RBAC) enforced server-side.
- Salted SHA-256 cryptographic password hashing.
- File upload isolation with unique UUID sanitization to prevent code execution.
- Mandatory human review policies: AI never auto-declares high-voltage or life-critical incidents safe without supervisor approval.

---

## 🧪 Verification & Automated Testing

Campus Guardian includes an automated integration test suite in `backend/test_direct.py`.
To run tests:

```powershell
cd backend
python test_direct.py
```
**Results:** All 10 verification modules passed with 100% success.
