from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from auth import (
    verify_password, create_access_token, get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.Token)
def login(form_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.email).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    access_token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.post("/demo-login/{role}", response_model=schemas.Token)
def demo_login(role: str, db: Session = Depends(get_db)):
    """
    Hackathon 1-click role switcher:
    - 'student' -> Alex Johnson (student@campus.demo)
    - 'maintenance' -> Carlos Rodriguez (maintenance@campus.demo)
    - 'admin' -> Dr. Eleanor Vance (admin@campus.demo)
    """
    role_email_map = {
        "student": "student@campus.demo",
        "maintenance": "maintenance@campus.demo",
        "admin": "admin@campus.demo"
    }

    email = role_email_map.get(role.lower())
    if not email:
        raise HTTPException(status_code=400, detail="Invalid demo role. Choose student, maintenance, or admin.")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found. Ensure database is seeded.")

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.get("/leaderboard", response_model=List[schemas.UserResponse])
def get_leaderboard(db: Session = Depends(get_db)):
    """
    Gamification Leaderboard for students reporting genuine infrastructure issues.
    """
    top_students = db.query(models.User).filter(
        models.User.role == "student"
    ).order_by(models.User.impact_score.desc()).limit(10).all()
    return top_students
