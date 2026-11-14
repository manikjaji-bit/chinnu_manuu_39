import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import engine, Base, SessionLocal
import models
from seed_data import seed_database
from routers import (
    auth_router,
    complaints_router,
    maintenance_router,
    admin_router,
    ai_router,
    predictive_router,
    notifications_router,
    buildings_router
)

# 1. Initialize DB tables
Base.metadata.create_all(bind=engine)

# 2. Seed initial data
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

# 3. Create FastAPI app
app = FastAPI(
    title="CAMPUS GUARDIAN API",
    description="The Self-Healing AI-Powered Smart Campus Ecosystem API",
    version="1.0.0"
)

# 4. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Mount Static Uploads
UPLOAD_DIR = "/tmp/uploads" if os.environ.get("VERCEL") else os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# 6. Include API Routers
app.include_router(auth_router.router)
app.include_router(complaints_router.router)
app.include_router(maintenance_router.router)
app.include_router(admin_router.router)
app.include_router(ai_router.router)
app.include_router(predictive_router.router)
app.include_router(notifications_router.router)
app.include_router(buildings_router.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Campus Guardian AI Ecosystem",
        "version": "1.0.0"
    }

# 7. Serve Built Frontend if available
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("uploads"):
            return None
        requested_file = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(requested_file):
            return FileResponse(requested_file)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"message": "Campus Guardian API Active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
