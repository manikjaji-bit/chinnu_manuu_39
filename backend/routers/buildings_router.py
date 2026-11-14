from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/campus", tags=["Campus Buildings & Departments"])

@router.get("/buildings", response_model=List[schemas.BuildingResponse])
def get_buildings(db: Session = Depends(get_db)):
    return db.query(models.Building).order_by(models.Building.name).all()

@router.get("/departments", response_model=List[schemas.DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).order_by(models.Department.name).all()
