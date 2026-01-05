from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.api import deps
from app.services.social_service import social_service

router = APIRouter()

@router.get("/feed", response_model=List[schemas.Post])
def read_feed(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
) -> Any:
    """
    Get global community feed.
    """
    return social_service.get_feed(db, skip=skip, limit=limit)

@router.post("/posts", response_model=schemas.Post)
def create_post(
    *,
    db: Session = Depends(deps.get_db),
    post_in: schemas.PostCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new post.
    """
    return social_service.create_post(db, post_in, current_user.id)

@router.post("/posts/{id}/comments", response_model=schemas.Comment)
def create_comment(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    comment_in: schemas.CommentCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Add a comment to a post.
    """
    return social_service.create_comment(db, comment_in, id, current_user.id)
