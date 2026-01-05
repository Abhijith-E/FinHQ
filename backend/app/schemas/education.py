from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class LessonBase(BaseModel):
    title: str
    content: str
    duration_minutes: int
    order: int

class LessonCreate(LessonBase):
    module_id: int

class Lesson(LessonBase):
    id: int
    module_id: int
    is_completed: Optional[bool] = False # Computed field for current user

    class Config:
        orm_mode = True

class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: int

class ModuleCreate(ModuleBase):
    pass

class Module(ModuleBase):
    id: int
    lessons: List[Lesson] = []

    class Config:
        orm_mode = True

class UserProgressBase(BaseModel):
    user_id: int
    lesson_id: int
    completed_at: datetime

    class Config:
        orm_mode = True
