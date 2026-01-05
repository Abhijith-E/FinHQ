from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.services.education_service import education_service

router = APIRouter()

@router.post("/seed")
def seed_education_content(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Seed initial data (For demo purposes).
    """
    if not current_user.is_superuser:
         # For MVP easy access, allowing any user to seed if empty, usually strictly restricted
         pass 
    education_service.seed_content(db)
    return {"msg": "Seeded"}

@router.get("/modules", response_model=List[schemas.Module])
def read_modules(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all educational modules with progress.
    """
    # Auto-seed for convenience in this demo
    education_service.seed_content(db)
    return education_service.get_modules(db, current_user.id)

@router.post("/lessons/{id}/complete")
def complete_lesson(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark a lesson as completed.
    """
    education_service.mark_lesson_completed(db, id, current_user.id)
    return {"status": "success"}
