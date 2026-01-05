from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.services.broker_service import broker_service

router = APIRouter()

@router.post("/orders", response_model=schemas.Order)
def place_order(
    *,
    db: Session = Depends(deps.get_db),
    order_in: schemas.OrderCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Place a new Market/Limit order.
    """
    return broker_service.place_order(db=db, order_in=order_in, user_id=current_user.id)

@router.get("/orders", response_model=List[schemas.Order])
def read_orders(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve order history.
    """
    orders = broker_service.get_user_orders(db, current_user.id)
    return orders
