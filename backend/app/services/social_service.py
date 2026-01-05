from sqlalchemy.orm import Session
from app import models, schemas

class SocialService:
    def create_post(self, db: Session, post_in: schemas.PostCreate, user_id: int) -> models.Post:
        db_post = models.Post(
            user_id=user_id,
            title=post_in.title,
            content=post_in.content,
            ticker=post_in.ticker
        )
        db.add(db_post)
        db.commit()
        db.refresh(db_post)
        return db_post

    def get_feed(self, db: Session, skip: int = 0, limit: int = 50):
        # In a real app, this would be complex (following, algorithmic). 
        # For now, simplistic reverse-chronological global feed.
        posts = db.query(models.Post).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
        # Enrich with fake user names for now since we don't have UserProfile publicly eager loaded
        # In real implementation: join with User table
        return posts

    def create_comment(self, db: Session, comment_in: schemas.CommentCreate, post_id: int, user_id: int) -> models.Comment:
        db_comment = models.Comment(
            user_id=user_id,
            post_id=post_id,
            content=comment_in.content
        )
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        return db_comment

social_service = SocialService()
