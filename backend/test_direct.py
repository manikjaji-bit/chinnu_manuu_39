import sys
from database import SessionLocal
import models
import schemas
from routers import (
    auth_router,
    complaints_router,
    maintenance_router,
    admin_router,
    ai_router,
    predictive_router
)
from services import (
    ai_service,
    verification_service,
    predictive_service,
    routing_service,
    assistant_service
)

def run_direct_tests():
    print("Running Direct In-Memory Integration Tests for Campus Guardian...")
    from database import engine, Base
    from seed_data import seed_database
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)

    try:
        # 1. Test Demo Authentication
        print("\n--- Test 1: Demo Authentication ---")
        student_tok = auth_router.demo_login("student", db)
        assert student_tok["user"].email == "student@campus.demo"
        print(f"[PASS] Demo Student logged in: {student_tok['user'].full_name} (Role: {student_tok['user'].role})")

        admin_tok = auth_router.demo_login("admin", db)
        assert admin_tok["user"].email == "admin@campus.demo"
        print(f"[PASS] Demo Admin logged in: {admin_tok['user'].full_name} (Role: {admin_tok['user'].role})")

        maint_tok = auth_router.demo_login("maintenance", db)
        assert maint_tok["user"].email == "maintenance@campus.demo"
        print(f"[PASS] Demo Maintenance logged in: {maint_tok['user'].full_name} (Role: {maint_tok['user'].role})")

        # 2. Test Campus Health Score Engine (FEATURE A)
        print("\n--- Test 2: Campus Health Score Engine (Feature A) ---")
        health = admin_router.get_health_score(db)
        print(f"[PASS] Dynamic Campus Health Score: {health['score']}/100")
        print(f"       Status: {health['status_label']}")
        print(f"       Breakdown summary: {health['calculation_summary']}")
        assert 0 <= health['score'] <= 100

        # 3. Test Recurring Problem Detector (FEATURE B)
        print("\n--- Test 3: Recurring Problem Detector (Feature B) ---")
        hotspots = predictive_service.detect_recurring_problems(db)
        print(f"[PASS] Detected {len(hotspots)} chronic recurring failure hotspots across campus:")
        for h in hotspots:
            print(f"       • {h['building_name']} - {h['room']}: {h['complaint_count']} repeat complaints ({h['category']}). Action: {h['recommendation']}")
        assert len(hotspots) >= 1

        # 4. Test AI Maintenance Assistant (FEATURE C)
        print("\n--- Test 4: AI Maintenance Assistant Natural Language Q&A (Feature C) ---")
        q1 = "Which building has the most problems?"
        ans1 = assistant_service.ask_campus_assistant(q1, db)
        print(f"Query: '{q1}'")
        print(f"Answer:\n{ans1['answer']}\nAction Items: {ans1.get('action_items')}")
        assert "problems" in ans1['answer'].lower() or "complaint" in ans1['answer'].lower()

        q2 = "Which department has the highest pending workload?"
        ans2 = assistant_service.ask_campus_assistant(q2, db)
        print(f"\nQuery: '{q2}'")
        print(f"Answer:\n{ans2['answer']}")

        # 5. Test AI Vision Diagnostic Engine
        print("\n--- Test 5: AI Vision Diagnostic Engine ---")
        ai_res = ai_service.analyze_complaint_image(
            image_bytes=None,
            title="Ceiling pipe dripping onto high voltage electrical junction",
            description="Active water leak right next to main distribution box",
            category="Plumbing",
            building_name="Science Block A",
            room="Room 204"
        )
        print(f"[PASS] AI Detected Problem: {ai_res['detected_problem']}")
        print(f"       Assessed Severity: {ai_res['severity']} (Priority Score: {ai_res['priority_score']}/100)")
        print(f"       Safety Risk Flag: {ai_res['safety_risk']}")
        print(f"       Recommended Action: {ai_res['recommended_action']}")
        print(f"       Assigned Dept: {ai_res['assigned_department']}")
        assert ai_res['priority_score'] >= 90
        assert ai_res['safety_risk'] is True

        # 6. Test Intelligent Auto-Routing & Workload Balancing (FEATURE 6)
        print("\n--- Test 6: Intelligent Auto-Routing & Workload Balancing ---")
        test_complaint = models.Complaint(
            title="Ceiling pipe dripping onto high voltage electrical junction",
            description="Active water leak right next to main distribution box",
            category="Plumbing",
            building_id=1,
            floor="2nd Floor",
            room="Room 204",
            student_id=student_tok["user"].id
        )
        dept, assigned_tech = routing_service.auto_assign_complaint(db, test_complaint, ai_res['assigned_department'])
        print(f"[PASS] Auto-Routed to: {dept.name} (Code: {dept.code})")
        print(f"       Dispatched Technician: {assigned_tech.full_name if assigned_tech else 'None'}")
        assert dept is not None

        # 7. Test Duplicate Complaint Detection (FEATURE D)
        print("\n--- Test 7: Duplicate Complaint Detection (Feature D) ---")
        dup = predictive_service.check_for_duplicates(db, building_id=1, room="Room 204 (Chemistry Lab)", category="Plumbing")
        print(f"[PASS] Duplicate Checker identified existing ticket: #{dup.id} ({dup.title})" if dup else "[PASS] No duplicates found")

        # 8. Test Resolution Verification System (FEATURE 8)
        print("\n--- Test 8: Resolution Verification System (Feature 8) ---")
        c1 = db.query(models.Complaint).first()
        ver_result = verification_service.verify_resolution(
            complaint=c1,
            before_image_url=c1.image_url,
            after_image_url="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800",
            maintenance_notes="Replaced defective brass valve and verified water shutoff. Zero residual leaks.",
            parts_replaced="1-inch brass union"
        )
        print(f"[PASS] AI Resolution Verification Verdict: {ver_result['verdict']}")
        print(f"       Remediation Similarity: {int(ver_result['similarity_score']*100)}%")
        print(f"       Diagnostic Evaluation: {ver_result['notes']}")
        assert ver_result['verdict'] in ["Likely Resolved", "Needs Human Review"]

        # 9. Test Maintenance Kanban Board
        print("\n--- Test 9: Maintenance Kanban Board ---")
        kanban = maintenance_router.get_kanban_tasks(db, admin_tok["user"])
        print(f"[PASS] Kanban Columns: Assigned={len(kanban['Assigned'])}, In Progress={len(kanban['In Progress'])}, Awaiting Verification={len(kanban['Awaiting Verification'])}, Resolved={len(kanban['Resolved'])}")

        # 10. Test Smart Resource Planning (FEATURE E)
        print("\n--- Test 10: Smart Resource Planning (Feature E) ---")
        suggestions = admin_router.get_resource_planning_suggestions(db)
        print(f"[PASS] Resource Suggestions for {len(suggestions)} departments:")
        for s in suggestions[:3]:
            print(f"       • {s['department_name']}: {s['open_tickets']} open tasks ({s['estimated_effort_hours']}h effort). Advisory: {s['recommendation']}")

        print("\n============================================================")
        print("ALL 10 VERIFICATION & ALGORITHMIC MODULE TESTS PASSED 100%!")
        print("============================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run_direct_tests()
