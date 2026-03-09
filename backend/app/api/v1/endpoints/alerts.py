"""
Alerts API endpoints: CRUD for price alerts and notification management.
Async-first with WebSocket trigger readiness.
"""
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import models, schemas
from app.api import deps
from app.db.session import get_db
from app.services.alert_service import alert_service

router = APIRouter()


@router.post("/", response_model=schemas.Alert)
async def create_alert(
    *,
    db: AsyncSession = Depends(get_db),
    alert_in: schemas.AlertCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new price alert. Supported conditions: ABOVE, BELOW.
    Alert will be triggered when the stock price crosses the target.
    """
    return await alert_service.create_alert(db, alert_in, current_user.id)


@router.get("/", response_model=List[schemas.Alert])
async def get_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve all active and triggered alerts for the current user.
    """
    return await alert_service.get_user_alerts(db, current_user.id)


@router.delete("/{alert_id}")
async def delete_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a specific alert owned by the current user.
    """
    success = await alert_service.delete_alert(db, alert_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"success": True, "message": "Alert deleted"}


@router.get("/notifications", response_model=List[schemas.Notification])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve the latest 50 notifications for the current user.
    """
    return await alert_service.get_user_notifications(db, current_user.id)


@router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark a notification as read.
    """
    success = await alert_service.mark_notification_read(db, notification_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True}
