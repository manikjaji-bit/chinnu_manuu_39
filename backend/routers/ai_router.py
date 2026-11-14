import os
import shutil
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import schemas
from services.ai_service import analyze_complaint_image
from services.assistant_service import ask_campus_assistant
from services.supabase_service import supabase_service

router = APIRouter(prefix="/api/ai", tags=["AI Intelligence Engine"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/analyze-image")
async def scan_image_preview(
    title: Optional[str] = Form(""),
    description: Optional[str] = Form(""),
    category: Optional[str] = Form("General"),
    building_name: Optional[str] = Form(""),
    room: Optional[str] = Form(""),
    image: Optional[UploadFile] = File(None)
):
    """
    Direct image scanning endpoint. Allows real-time AI Vision analysis preview
    in the student submission form before final submission.
    """
    image_bytes = None
    saved_url = None

    if image and image.filename:
        image_bytes = await image.read()
        ext = os.path.splitext(image.filename)[1] or ".jpg"
        filename = f"scan_{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(image_bytes)
        
        # Upload preview to Supabase Storage
        supabase_url = supabase_service.upload_file(image_bytes, filename, content_type=image.content_type or "image/jpeg")
        saved_url = supabase_url if supabase_url else f"/uploads/{filename}"

    result = analyze_complaint_image(
        image_bytes=image_bytes,
        title=title or "Infrastructure anomaly",
        description=description or "Visible physical defect",
        category=category or "Infrastructure",
        building_name=building_name or "Campus Building",
        room=room or "Room"
    )

    result["uploaded_image_url"] = saved_url
    return result


@router.post("/assistant", response_model=schemas.AssistantQueryResponse)
def query_campus_assistant(
    payload: schemas.AssistantQueryRequest,
    db: Session = Depends(get_db)
):
    """
    FEATURE C: AI MAINTENANCE ASSISTANT
    Answers questions like:
    - 'Which building has the most problems?'
    - 'Which department has the highest pending workload?'
    - 'What are the most recurring complaints?'
    - 'Which issues require immediate attention?'
    """
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be blank")

    response = ask_campus_assistant(payload.query, db)
    return response
