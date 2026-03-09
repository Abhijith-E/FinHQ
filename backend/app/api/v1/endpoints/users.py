from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app import schemas, models
from app.api import deps
from app.db.session import get_db

router = APIRouter()

@router.get("/me", response_model=schemas.User)
async def read_user_me(
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get current user.
    """
    return current_user
