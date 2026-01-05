from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.services.alert_service import alert_service

router = APIRouter()

@router.post("/", response_model=schemas.Alert)
def create_alert(
    *,
    db: Session = Depends(deps.get_db),
    alert_in: schemas.AlertCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new price alert.
    """
    return alert_service.create_alert(db, alert_in, current_user.id)

@router.get("/", response_model=List[schemas.Alert])
def read_alerts(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve user alerts.
    """
    return alert_service.get_user_alerts(db, current_user.id)

@router.get("/notifications", response_model=List[schemas.Notification])
def read_notifications(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve notifications.
    """
    return alert_service.get_user_notifications(db, current_user.id)
