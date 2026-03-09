"""
Trading API endpoints: order placement, order management, positions, and trade history.
Fully async using FastAPI dependency injection and AsyncSession.
"""
from typing import Any, List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app import models, schemas
from app.api import deps
from app.db.session import get_db
from app.services.broker_service import broker_service

router = APIRouter()


@router.post("/orders", response_model=schemas.Order)
async def place_order(
    *,
    db: AsyncSession = Depends(get_db),
    order_in: schemas.OrderCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Place a new Market, Limit, or Stop order in paper trading simulation.
    Market orders are filled instantly at simulated market price.
    """
    return await broker_service.place_order(db=db, order_in=order_in, user_id=current_user.id)


@router.get("/orders", response_model=List[schemas.Order])
async def get_orders(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve all open and historical orders for the current user.
    """
    return await broker_service.get_user_orders(db, current_user.id)


@router.delete("/orders/{order_id}", response_model=schemas.Order)
async def cancel_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Cancel a pending order. Only PENDING orders can be cancelled.
    """
    return await broker_service.cancel_order(db, order_id, current_user.id)


@router.get("/positions")
async def get_positions(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current portfolio positions with live prices and unrealized P&L.
    """
    return await broker_service.get_user_positions(db, current_user.id)


@router.get("/portfolio/summary")
async def get_portfolio_summary(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get a full portfolio summary including positions, cash, P&L and key metrics.
    """
    return await broker_service.get_user_positions(db, current_user.id)
