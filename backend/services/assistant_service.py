import os
import re
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from services.predictive_service import detect_recurring_problems, calculate_campus_health_score, get_preventive_maintenance_forecast

def ask_campus_assistant(query: str, db: Session) -> Dict[str, Any]:
    """
    Campus Guardian AI Maintenance Assistant.
    Provides natural language answers dynamically grounded in real database state.
    """
    q = query.lower()

    # 1. "Which building has the most problems?"
    if any(k in q for k in ["which building", "most problems", "highest complaints", "worst building", "building with the most"]):
        building_stats = db.query(
            models.Building.name,
            func.count(models.Complaint.id).label("total")
        ).join(models.Complaint, models.Complaint.building_id == models.Building.id)\
         .group_by(models.Building.name)\
         .order_by(func.count(models.Complaint.id).desc()).all()

        if building_stats:
            top_building = building_stats[0]
            breakdown = ", ".join([f"{name} ({count} reports)" for name, count in building_stats[:3]])
            answer = (
                f"**{top_building[0]}** currently leads the campus with **{top_building[1]} total complaints**.\n\n"
                f"Top affected zones across campus:\n"
                + "\n".join([f"- **{name}**: {count} reported issues" for name, count in building_stats[:4]])
                + f"\n\n**Recommendation**: Prioritize an on-site facilities audit for {top_building[0]} to inspect main mechanical and electrical risers."
            )
            return {
                "query": query,
                "answer": answer,
                "action_items": [
                    f"Schedule engineering inspection at {top_building[0]}",
                    "Review open plumbing and electrical tickets for this facility"
                ]
            }

    # 2. "Which department has the highest pending workload?"
    if any(k in q for k in ["department", "workload", "pending workload", "busiest team", "highest pending"]):
        dept_stats = db.query(
            models.Department.name,
            func.count(models.Complaint.id).label("pending")
        ).join(models.Complaint, models.Complaint.department_id == models.Department.id)\
         .filter(models.Complaint.status.in_(["Submitted", "AI Analysed", "Assigned", "In Progress"]))\
         .group_by(models.Department.name)\
         .order_by(func.count(models.Complaint.id).desc()).all()

        if dept_stats:
            top_dept = dept_stats[0]
            answer = (
                f"The **{top_dept[0]}** currently has the heaviest active queue with **{top_dept[1]} pending tasks**.\n\n"
                f"Current Department Backlogs:\n"
                + "\n".join([f"- **{name}**: {count} open tickets" for name, count in dept_stats])
                + f"\n\n**Resource Allocation Advice**: Rebalance staff by temporarily shifting cross-trained technicians to {top_dept[0]} to prevent SLA breaches."
            )
            return {
                "query": query,
                "answer": answer,
                "action_items": [
                    f"Authorize overtime or reassign technicians to {top_dept[0]}",
                    "Check for bulk spare parts availability"
                ]
            }

    # 3. "What are the most recurring complaints?"
    if any(k in q for k in ["recurring", "repeated", "repeat", "frequent"]):
        hotspots = detect_recurring_problems(db)
        if hotspots:
            items = "\n".join([
                f"- **{h['building_name']} - {h['room']}**: {h['complaint_count']} incidents ({h['category']}). *{h['recommendation']}*"
                for h in hotspots[:5]
            ])
            answer = (
                f"Campus Guardian has identified **{len(hotspots)} chronic recurring failure hotspots** requiring preventative attention:\n\n"
                f"{items}\n\n"
                f"**Root-Cause Warning**: Isolated superficial repairs in these rooms have failed repeatedly. Deep asset replacement is strongly indicated."
            )
            return {
                "query": query,
                "answer": answer,
                "action_items": [
                    "Issue preventative overhaul work orders for top hotspots",
                    "Perform manufacturer warranty check on failed units"
                ]
            }
        else:
            return {
                "query": query,
                "answer": "Currently no severe recurring failure hotspots have crossed the detection threshold of 2+ repeat incidents in the same room.",
                "action_items": ["Continue monitoring automated telemetry"]
            }

    # 4. "Which issues require immediate attention?" / Critical incidents
    if any(k in q for k in ["immediate", "urgent", "critical", "danger", "safety", "attention"]):
        critical_issues = db.query(models.Complaint).filter(
            models.Complaint.severity.in_(["High", "Critical"]),
            models.Complaint.status.in_(["Submitted", "AI Analysed", "Assigned", "In Progress", "Awaiting Verification"])
        ).order_by(models.Complaint.priority_score.desc()).all()

        if critical_issues:
            issues_list = "\n".join([
                f"- **[Priority {c.priority_score}/100]** #{c.id}: **{c.title}** ({c.category}) at {c.building.name if c.building else 'Campus'} {c.floor} - {c.room}. Status: *{c.status}*"
                for c in critical_issues[:5]
            ])
            answer = (
                f"There are **{len(critical_issues)} high-priority incidents** currently active that pose severe safety or operational risks:\n\n"
                f"{issues_list}\n\n"
                f"**Protocol**: Immediate dispatch is mandated. Electrical sparking or water ingress near power conduits must be isolated at once."
            )
            return {
                "query": query,
                "answer": answer,
                "action_items": [
                    "Confirm isolation of affected power / water lines",
                    "Directly verify on-site safety perimeter with security"
                ]
            }
        else:
            return {
                "query": query,
                "answer": "All critical incidents have been resolved or stabilized! No emergency safety escalations are currently pending.",
                "action_items": ["Maintain routine monitoring"]
            }

    # 5. "What preventive maintenance should be scheduled?"
    if any(k in q for k in ["preventive", "preventative", "inspection", "forecast", "schedule"]):
        forecasts = get_preventive_maintenance_forecast(db)
        if forecasts:
            top_f = forecasts[:3]
            schedules = "\n".join([
                f"- **{f['building_name']}**: Vulnerability in **{f['primary_vulnerability']}** (Failure Risk: {f['failure_probability_pct']}%). Recommended: **{f['recommended_schedule']}**."
                for f in top_f
            ])
            answer = (
                f"Based on historical breakdown frequency and aging infrastructure indicators, schedule the following preventive inspections:\n\n"
                f"{schedules}\n\n"
                f"**Smart Strategy**: Addressing these {len(top_f)} locations proactively will boost your Campus Health Score by approximately +6 points and avert emergency downtime."
            )
            return {
                "query": query,
                "answer": answer,
                "action_items": [
                    f"Dispatch preventive HVAC/Plumbing check to {top_f[0]['building_name']}",
                    "Audit spare parts inventory for upcoming inspections"
                ]
            }

    # 6. Gemini-powered dynamic answering for general questions
    api_key = os.getenv("GEMINI_API_KEY")
    health = calculate_campus_health_score(db)

    if api_key:
        try:
            import requests
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={api_key}"
            sys_info = (
                f"You are the Campus Guardian AI Executive Assistant.\n"
                f"Current Campus Health: {health['score']}/100 ({health['status_label']}), "
                f"Open tickets: {health['total_open_complaints']}, "
                f"Critical incidents: {health['total_critical_incidents']}, "
                f"Average turnaround: {health['avg_resolution_hours']}h, "
                f"Recurring hotspot zones: {health['recurring_hotspot_count']}.\n"
                f"Answer the user query concisely, accurately, and professionally with markdown bullets."
            )
            payload = {
                "contents": [{"parts": [{"text": sys_info + f"\nUser Query: {query}"}]}],
                "generationConfig": {"temperature": 0.3}
            }
            res = requests.post(url, json=payload, timeout=12)
            if res.status_code == 200:
                answer_text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                return {
                    "query": query,
                    "answer": answer_text,
                    "action_items": [
                        "Log executive action in facility audit ledger",
                        "Monitor real-time resolution telemetry"
                    ]
                }
        except Exception as e:
            print(f"[Assistant Service] Gemini dynamic Q&A fallback: {e}")

    # Default / General Executive Overview Fallback
    answer = (
        f"Campus Guardian Assistant telemetry summary:\n\n"
        f"- **Campus Health Score**: **{health['score']}/100** ({health['status_label']})\n"
        f"- **Active Complaints**: {health['total_open_complaints']} total ({health['total_critical_incidents']} critical)\n"
        f"- **Average Resolution Turnaround**: {health['avg_resolution_hours']} hours\n"
        f"- **Recurring Hotspots Detected**: {health['recurring_hotspot_count']} zones\n\n"
        f"You can ask me specific questions like:\n"
        f"- *'Which building has the most problems?'*\n"
        f"- *'Which department has the highest pending workload?'*\n"
        f"- *'What are the most recurring complaints?'*\n"
        f"- *'Which issues require immediate attention?'*"
    )
    return {
        "query": query,
        "answer": answer,
        "action_items": [
            "Review Campus Health Score breakdown",
            "Monitor live AI resolution verification queue"
        ]
    }
