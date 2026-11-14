import os
import sys
import webbrowser

def main():
    print("=" * 65)
    print("   CAMPUS GUARDIAN: The Self-Healing AI Smart Campus Ecosystem   ")
    print("       'Detect Problems Before They Become Disasters'            ")
    print("=" * 65)
    print("\nStarting unified server at: http://127.0.0.1:8000")
    print("Features ready:")
    print("  • React + TypeScript Single Page Application (Served at /)")
    print("  • FastAPI REST APIs & Swagger Docs (Served at /docs)")
    print("  • Vision AI Image Diagnostics & Resolution Verification")
    print("  • Dynamic Campus Health Score (0-100) & Predictive Engine")
    print("  • Interactive OpenStreetMap Campus Telemetry")
    print("\nDemo Accounts:")
    print("  - Student:     student@campus.demo     / password: password123")
    print("  - Maintenance: maintenance@campus.demo / password: password123")
    print("  - Admin:       admin@campus.demo       / password: password123")
    print("  * Instant 1-click persona switcher available in top navbar!")
    print("=" * 65 + "\n")

    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), "backend")
    os.chdir(backend_dir)
    sys.path.insert(0, backend_dir)

    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

if __name__ == "__main__":
    main()
