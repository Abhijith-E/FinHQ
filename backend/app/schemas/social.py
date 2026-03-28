from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime

# Shared properties for Comment
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    user_id: int
    post_id: int
    created_at: datetime
    # In a real app, we'd include user info (name/avatar) here
    user_name: Optional[str] = "User" 
    model_config = ConfigDict(from_attributes=True)

# Shared properties for Post
class PostBase(BaseModel):
    title: str
    content: str
    ticker: Optional[str] = None

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: int
    user_id: int
    created_at: datetime
    comments: List[Comment] = []
    user_name: Optional[str] = "User"
    model_config = ConfigDict(from_attributes=True)
