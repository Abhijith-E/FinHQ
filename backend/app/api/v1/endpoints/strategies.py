from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Strategy])
def read_strategies(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve strategies.
    """
    strategies = db.query(models.Strategy).filter(models.Strategy.user_id == current_user.id).offset(skip).limit(limit).all()
    return strategies

@router.post("/", response_model=schemas.Strategy)
def create_strategy(
    *,
    db: Session = Depends(deps.get_db),
    strategy_in: schemas.StrategyCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new strategy.
    """
    strategy = models.Strategy(
        name=strategy_in.name,
        description=strategy_in.description,
        definition=strategy_in.definition,
        user_id=current_user.id
    )
    db.add(strategy)
    db.commit()
    db.refresh(strategy)
    return strategy

@router.delete("/{id}", response_model=schemas.Strategy)
def delete_strategy(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a strategy.
    """
    strategy = db.query(models.Strategy).filter(
        models.Strategy.id == id, models.Strategy.user_id == current_user.id
    ).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    db.delete(strategy)
    db.commit()
    return strategy
