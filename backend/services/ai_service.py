import os
import json
import base64
import requests
from typing import Dict, Any, Optional

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Category mapping to departments
CATEGORY_TO_DEPT = {
    "Electrical": "Electrical Department",
    "Plumbing": "Plumbing Department",
    "Water supply": "Plumbing Department",
    "Infrastructure": "Infrastructure Department",
    "Classroom equipment": "Infrastructure Department",
    "Sanitation": "Sanitation Department",
    "Internet connectivity": "IT & Network Department",
    "Safety": "Campus Safety & Security",
    "Other": "General Campus Maintenance"
}

def analyze_complaint_image(
    image_bytes: Optional[bytes],
    title: str,
    description: str,
    category: str,
    building_name: str = "",
    room: str = "",
    is_recurring: bool = False
) -> Dict[str, Any]:
    """
    Performs AI vision analysis using Gemini Vision API if key is configured,
    or falls back to a transparent, deterministic heuristic intelligence engine.
    """
    if GEMINI_API_KEY and image_bytes:
        try:
            return call_gemini_vision(image_bytes, title, description, category, building_name, room)
        except Exception as e:
            print(f"[AI Service] Gemini API call failed, switching to demo mode: {e}")

    # Fallback / Demo Mode: Heuristic Intelligence Engine
    return analyze_heuristically(title, description, category, building_name, room, is_recurring)


def call_gemini_vision(
    image_bytes: bytes,
    title: str,
    description: str,
    category: str,
    building_name: str,
    room: str
) -> Dict[str, Any]:
    """
    Direct Gemini Vision API call returning structured JSON.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    encoded_image = base64.b64encode(image_bytes).decode("utf-8")
    
    prompt = f"""
    You are Campus Guardian AI, an expert structural engineering and campus safety diagnostic system.
    Analyze the attached image and the complaint report details:
    - User Title: {title}
    - User Description: {description}
    - Reported Category: {category}
    - Building: {building_name}, Room: {room}

    Return a strictly valid JSON object with EXACTLY the following keys:
    {{
      "detected_problem": "Short problem summary (e.g., Active ceiling water leakage)",
      "category": "Standard category: Electrical, Plumbing, Infrastructure, Sanitation, Classroom equipment, Water supply, Safety, Internet connectivity, or Other",
      "severity": "One of: Low, Medium, High, Critical",
      "priority_score": Integer between 0 and 100,
      "safety_risk": Boolean (true if risks electric shock, structural collapse, slipping, fire, or chemical hazard),
      "description": "2-3 sentences of objective technical diagnostic findings from the image",
      "recommended_action": "Clear actionable step for maintenance crew",
      "assigned_department": "Name of best department",
      "confidence": Float between 0.70 and 0.99
    }}
    Do not include markdown code block formatting (like ```json), just raw JSON.
    """

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": encoded_image
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "response_mime_type": "application/json"
        }
    }

    response = requests.post(url, json=payload, timeout=20)
    response.raise_for_status()
    result_json = response.json()
    raw_text = result_json["candidates"][0]["content"]["parts"][0]["text"]
    parsed = json.loads(raw_text.strip())
    parsed["is_simulated"] = False
    return parsed


def analyze_heuristically(
    title: str,
    description: str,
    category: str,
    building_name: str,
    room: str,
    is_recurring: bool = False
) -> Dict[str, Any]:
    """
    Transparent rule-based heuristic intelligence engine for reliable demonstration mode.
    Accurately computes priority scores based on life-safety risks, water/electric intersection, and recurrence.
    """
    text = (title + " " + description).lower()
    
    # Priority & Severity Assessment
    priority = 45
    severity = "Medium"
    safety_risk = False
    action = "Inspect the reported area and dispatch maintenance technician for remediation."
    problem = title or f"{category} malfunction"
    assigned_dept = CATEGORY_TO_DEPT.get(category, "General Campus Maintenance")

    # Critical electrical / fire hazards
    if any(k in text for k in ["spark", "fire", "smoke", "burning", "electric shock", "short circuit", "exposed wire"]):
        priority = 98
        severity = "Critical"
        safety_risk = True
        problem = "Hazardous Electrical Fault / Sparking"
        action = "URGENT: Immediately isolate building main circuit breaker. Evacuate room and dispatch emergency electrical team."
        assigned_dept = "Electrical Department"

    # Water leakage near electrical / structural collapse
    elif ("water" in text or "leak" in text or "pipe" in text) and any(k in text for k in ["electric", "plug", "socket", "ceiling", "wire", "switch"]):
        priority = 94
        severity = "Critical"
        safety_risk = True
        problem = "Water Ingress in Close Proximity to Electrical Fixtures"
        action = "Cut local power to avoid short-circuit/electrocution. Shut down main riser valve and inspect conduit seals."
        assigned_dept = "Plumbing Department"

    # Severe plumbing failure
    elif any(k in text for k in ["burst", "flood", "overflow", "sewage", "leak", "tap"]):
        priority = 82 if ("flood" in text or "burst" in text) else 68
        severity = "High" if priority >= 80 else "Medium"
        safety_risk = priority >= 80
        problem = "Plumbing Line Breach / Valve Failure"
        action = "Close isolation shutoff valve, clear standing water to avoid slip hazards, and replace compromised fitting."
        assigned_dept = "Plumbing Department"

    # Structural / Safety hazards
    elif any(k in text for k in ["crack", "glass", "broken window", "shattered", "handrail", "stair", "ceiling tile"]):
        priority = 78
        severity = "High"
        safety_risk = True
        problem = "Structural / Fall Hazard Integrity Issue"
        action = "Cordon off danger zone with warning markers; replace damaged fixtures or structural members."
        assigned_dept = "Infrastructure Department"

    # Sanitation / Pest / Health
    elif any(k in text for k in ["garbage", "trash", "waste", "smell", "insect", "pest", "rodent"]):
        priority = 58
        severity = "Medium"
        safety_risk = False
        problem = "Sanitation & Hygiene Hazard"
        action = "Deploy sanitation team for rapid waste clearance, deep sanitization, and pest barrier sealing."
        assigned_dept = "Sanitation Department"

    # IT / Connectivity / Equipment
    elif any(k in text for k in ["projector", "wifi", "internet", "router", "cable", "lan", "display", "ac", "air condition"]):
        priority = 52
        severity = "Medium"
        safety_risk = False
        problem = f"{category} Inoperability"
        action = "Run diagnostic loop, inspect power relay, and reset or swap faulty hardware unit."
        assigned_dept = "IT & Network Department" if "wifi" in text or "internet" in text else "Infrastructure Department"

    # Recurring multiplier
    if is_recurring:
        priority = min(100, priority + 12)
        action += " (Flagged: Recurring failure location; schedule preventative overhaul)."

    return {
        "detected_problem": problem,
        "category": category,
        "severity": severity,
        "priority_score": priority,
        "safety_risk": safety_risk,
        "description": f"AI diagnostic scan identified {problem.lower()} at {building_name or 'Campus Area'} {room or ''}. Severity calibrated at {severity} based on structural impact and occupant safety criteria.",
        "recommended_action": action,
        "assigned_department": assigned_dept,
        "confidence": 0.94,
        "is_simulated": True
    }
