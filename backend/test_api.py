import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("Testing Campus Guardian Endpoints...")

    # 1. Health
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health failed: {r.text}"
    print("[PASS] /api/health:", r.json())

    # 2. Demo Login - Student
    r = client.post("/api/auth/demo-login/student")
    assert r.status_code == 200, f"Demo login student failed: {r.text}"
    student_token = r.json()["access_token"]
    print("[PASS] /api/auth/demo-login/student:", r.json()["user"]["full_name"])

    # 3. Demo Login - Admin
    r = client.post("/api/auth/demo-login/admin")
    assert r.status_code == 200, f"Demo login admin failed: {r.text}"
    admin_token = r.json()["access_token"]
    print("[PASS] /api/auth/demo-login/admin:", r.json()["user"]["full_name"])

    # 4. Campus Health Score
    r = client.get("/api/admin/health-score")
    assert r.status_code == 200, f"Health score failed: {r.text}"
    print(f"[PASS] /api/admin/health-score: Score {r.json()['score']}/100 - {r.json()['status_label']}")

    # 5. Admin Overview
    r = client.get("/api/admin/overview")
    assert r.status_code == 200, f"Overview failed: {r.text}"
    print("[PASS] /api/admin/overview: Active", r.json()["active_complaints"], "Critical:", r.json()["critical_incidents"])

    # 6. List Complaints
    r = client.get("/api/complaints/")
    assert r.status_code == 200, f"Complaints list failed: {r.text}"
    complaints = r.json()
    print(f"[PASS] /api/complaints/: Loaded {len(complaints)} records")
    assert len(complaints) >= 15, f"Expected 15+ complaints, got {len(complaints)}"

    # 7. AI Assistant Query
    r = client.post("/api/ai/assistant", json={"query": "Which building has the most problems?"})
    assert r.status_code == 200, f"Assistant failed: {r.text}"
    print("[PASS] /api/ai/assistant (Building Query):", r.json()["answer"][:90] + "...")

    # 8. Predictive Hotspots
    r = client.get("/api/predictive/recurring-hotspots")
    assert r.status_code == 200, f"Hotspots failed: {r.text}"
    print(f"[PASS] /api/predictive/recurring-hotspots: Found {len(r.json())} hotspots")

    # 9. Map Data
    r = client.get("/api/predictive/map-data")
    assert r.status_code == 200, f"Map data failed: {r.text}"
    print(f"[PASS] /api/predictive/map-data: {len(r.json()['buildings'])} buildings, {len(r.json()['complaint_markers'])} markers")

    # 10. Submit a new complaint & verify AI auto-analysis & routing
    submit_payload = {
        "title": "Severe water dripping near distribution board",
        "description": "Continuous leak right above electrical junction box",
        "category": "Plumbing",
        "building_id": 1,
        "floor": "2nd Floor",
        "room": "Room 205"
    }
    r = client.post(
        "/api/complaints/submit",
        data=submit_payload,
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert r.status_code == 200, f"Submit failed: {r.text}"
    new_c = r.json()
    print(f"[PASS] /api/complaints/submit: Ticket #{new_c['id']} created. Priority: {new_c['priority_score']}/100. Status: {new_c['status']}")
    assert new_c["priority_score"] >= 85, f"Expected high priority for water near electrical, got {new_c['priority_score']}"

    # 11. Maintenance Kanban
    r = client.get("/api/maintenance/kanban", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200, f"Kanban failed: {r.text}"
    kanban = r.json()
    print(f"[PASS] /api/maintenance/kanban: Assigned: {len(kanban['Assigned'])}, In Progress: {len(kanban['In Progress'])}, Verification: {len(kanban['Awaiting Verification'])}, Resolved: {len(kanban['Resolved'])}")

    # 12. Submit resolution evidence for ticket #1 (triggers AI verification)
    evidence_payload = {
        "after_image_url": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800",
        "maintenance_notes": "Replaced burst pipe section, sealed riser valve and confirmed no further leaks.",
        "parts_replaced": "1-inch brass union, PTFE tape",
        "work_duration_hours": 2.0
    }
    r = client.post(
        f"/api/complaints/{new_c['id']}/upload-evidence",
        json=evidence_payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert r.status_code == 200, f"Evidence upload failed: {r.text}"
    ev_res = r.json()
    print(f"[PASS] Resolution Evidence Uploaded for #{new_c['id']}. New Status: {ev_res['status']}")

    # 13. Verify Signoff
    r = client.post(
        f"/api/complaints/{new_c['id']}/verify-signoff?approved=true",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert r.status_code == 200, f"Signoff failed: {r.text}"
    print(f"[PASS] Resolution Sign-off: #{new_c['id']} is now {r.json()['status']}")

    # 14. Serve Built SPA index.html
    r = client.get("/")
    assert r.status_code == 200, f"SPA root failed: {r.status_code}"
    assert "CAMPUS GUARDIAN" in r.text, "SPA title missing from index.html"
    print("[PASS] GET /: Built React Single Page Application successfully served!")

    print("\nALL 14 CORE ENGINE & API TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    run_tests()
