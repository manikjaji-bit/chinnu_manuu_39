import time
import threading
import uvicorn
import requests

def run_server():
    uvicorn.run("main:app", host="127.0.0.1", port=8000, log_level="warning")

def run_suite():
    print("[1/10] Starting background FastAPI server on 127.0.0.1:8000...")
    t = threading.Thread(target=run_server, daemon=True)
    t.start()

    # Wait for server to bind
    for _ in range(15):
        try:
            r = requests.get("http://127.0.0.1:8000/api/health", timeout=1)
            if r.status_code == 200:
                print("[2/10] Server connected successfully!")
                break
        except Exception:
            time.sleep(0.5)

    base = "http://127.0.0.1:8000"

    # 1. Health
    r = requests.get(f"{base}/api/health")
    assert r.status_code == 200
    print("[PASS] Health Check:", r.json())

    # 2. Demo Login Student
    r = requests.post(f"{base}/api/auth/demo-login/student")
    assert r.status_code == 200
    student_token = r.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("[PASS] Demo Login (Student):", r.json()["user"]["full_name"])

    # 3. Demo Login Admin
    r = requests.post(f"{base}/api/auth/demo-login/admin")
    assert r.status_code == 200
    admin_token = r.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[PASS] Demo Login (Admin):", r.json()["user"]["full_name"])

    # 4. Campus Health Score
    r = requests.get(f"{base}/api/admin/health-score")
    assert r.status_code == 200
    hs = r.json()
    print(f"[PASS] Campus Health Score: {hs['score']}/100 ({hs['status_label']})")

    # 5. Admin Overview
    r = requests.get(f"{base}/api/admin/overview")
    assert r.status_code == 200
    ov = r.json()
    print(f"[PASS] Executive Overview: Total={ov['total_complaints']}, Active={ov['active_complaints']}, Critical={ov['critical_incidents']}")

    # 6. List 15+ Complaints
    r = requests.get(f"{base}/api/complaints/")
    assert r.status_code == 200
    complaints = r.json()
    print(f"[PASS] Complaints Ledger: {len(complaints)} records")
    assert len(complaints) >= 15

    # 7. AI Assistant
    r = requests.post(f"{base}/api/ai/assistant", json={"query": "Which building has the most problems?"})
    assert r.status_code == 200
    ans = r.json()
    print(f"[PASS] AI Maintenance Assistant: {ans['answer'][:80]}...")

    # 8. Submit New Complaint & Auto-Routing
    submit_data = {
        "title": "Water dripping directly onto electrical outlet",
        "description": "Continuous leak right next to 240V socket",
        "category": "Plumbing",
        "building_id": 1,
        "floor": "2nd Floor",
        "room": "Room 205"
    }
    r = requests.post(f"{base}/api/complaints/submit", data=submit_data, headers=student_headers)
    assert r.status_code == 200
    new_ticket = r.json()
    print(f"[PASS] New Complaint Submitted: ID #{new_ticket['id']} (Priority: {new_ticket['priority_score']}/100, Routed to Dept #{new_ticket['department_id']})")
    assert new_ticket["priority_score"] >= 85, f"Expected high priority, got {new_ticket['priority_score']}"

    # 9. Maintenance Kanban
    r = requests.get(f"{base}/api/maintenance/kanban", headers=admin_headers)
    assert r.status_code == 200
    kb = r.json()
    print(f"[PASS] Maintenance Kanban: Assigned={len(kb['Assigned'])}, InProgress={len(kb['In Progress'])}, AwaitingVerification={len(kb['Awaiting Verification'])}, Resolved={len(kb['Resolved'])}")

    # 10. SPA Frontend Root
    r = requests.get(f"{base}/")
    assert r.status_code == 200
    assert "CAMPUS GUARDIAN" in r.text
    print("[PASS] SPA Frontend Serving: index.html 200 OK verified")

    print("\nSUCCESS: All 10 live integration tests passed with 100% functionality!")

if __name__ == "__main__":
    run_suite()
