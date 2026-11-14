from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db
import models
import schemas
from auth import (
    verify_password, hash_password, create_access_token, get_current_user, require_authenticated_user
)
from seed_data import seed_database

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Token)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new campus user (Student, Maintenance Staff, or Administrator).
    Returns an active JWT session token upon registration.
    """
    email = payload.email.lower().strip()
    full_name = payload.full_name.strip()
    password = payload.password.strip()

    if not email or "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid campus email address is required."
        )

    if not full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required."
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    existing = db.query(models.User).filter(func.lower(models.User.email) == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in instead."
        )

    role = payload.role.lower().strip() if payload.role else "student"
    if role not in ["student", "maintenance", "admin"]:
        role = "student"

    # For maintenance staff, guarantee a department assignment
    department_id = payload.department_id
    if role == "maintenance" and not department_id:
        # Default to first department
        first_dept = db.query(models.Department).first()
        department_id = first_dept.id if first_dept else 1

    new_user = models.User(
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        role=role,
        department_id=department_id if role == "maintenance" else None,
        impact_score=100 if role == "student" else (500 if role == "admin" else 200),
        avatar_url=payload.avatar_url or (
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" if role == "admin"
            else ("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" if role == "maintenance"
            else "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
        )
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.email, "role": new_user.role, "id": new_user.id})
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=schemas.Token)
def login(form_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates user with email and password.
    Supports case-insensitive emails and returns a JWT bearer token.
    """
    email = form_data.email.lower().strip()
    password = form_data.password.strip()

    user = db.query(models.User).filter(func.lower(models.User.email) == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect campus email or password. Please verify your credentials."
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

    normalized_role = role.lower().strip()
    email = role_email_map.get(normalized_role)
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Invalid demo role. Choose student, maintenance, or admin."
        )

    user = db.query(models.User).filter(func.lower(models.User.email) == email).first()
    if not user:
        # Auto-seed database if demo user is missing
        seed_database(db)
        user = db.query(models.User).filter(func.lower(models.User.email) == email).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"Demo {role} account could not be initialized."
        )

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(require_authenticated_user)):
    """
    Returns the currently authenticated user's profile and permissions.
    """
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
