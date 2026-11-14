import hashlib
import os
import base64
import json
import time
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models

SECRET_KEY = os.getenv("SECRET_KEY", "campus-guardian-super-secret-key-hackathon-2026")
TOKEN_EXPIRY_SECONDS = 86400 * 7 # 7 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def hash_password(password: str) -> str:
    # Deterministic salted SHA-256 for maximum portable cross-platform stability
    salt = "cg_salt_2026_"
    return hashlib.sha256((salt + password).encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = int(time.time()) + TOKEN_EXPIRY_SECONDS
    encoded_payload = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    signature = hashlib.sha256((encoded_payload + SECRET_KEY).encode()).hexdigest()
    return f"{encoded_payload}.{signature}"

def decode_access_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload_b64, signature = parts
        expected_signature = hashlib.sha256((payload_b64 + SECRET_KEY).encode()).hexdigest()
        if signature != expected_signature:
            return None
        payload = json.loads(base64.urlsafe_b64decode(payload_b64.encode()).decode())
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    if not token:
        # Fallback to demo student user for instant preview without login blocker
        demo_user = db.query(models.User).filter(models.User.email == "student@campus.demo").first()
        if demo_user:
            return demo_user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload["sub"]
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")
    return user

def require_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Administrator permissions required")
    return current_user

def require_maintenance_or_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role not in ["maintenance", "admin"]:
        raise HTTPException(status_code=403, detail="Maintenance or Admin permissions required")
    return current_user
