from sqlalchemy.orm import Session
from app import models, schemas
from typing import List

class EducationService:
    def get_modules(self, db: Session, user_id: int) -> List[models.Module]:
        modules = db.query(models.Module).order_by(models.Module.order).all()
        
        # In a real efficient implementation, we'd batch fetch progress or join.
        # For simple MVP, we can iterate or just let the client handle it if data is small.
        # Let's check progress for the user to mark lessons as completed.
        completed_lesson_ids = db.query(models.UserProgress.lesson_id).filter(
            models.UserProgress.user_id == user_id
        ).all()
        completed_ids_set = {row[0] for row in completed_lesson_ids}

        # Apply is_completed flag (simplified logic, usually done via Pydantic or specific DTOs)
        for mod in modules:
            for lesson in mod.lessons:
                # Dynamically attaching attribute for Pydantic serialization
                lesson.is_completed = lesson.id in completed_ids_set
        
        return modules

    def mark_lesson_completed(self, db: Session, lesson_id: int, user_id: int):
        existing = db.query(models.UserProgress).filter(
            models.UserProgress.user_id == user_id,
            models.UserProgress.lesson_id == lesson_id
        ).first()
        
        if not existing:
            progress = models.UserProgress(user_id=user_id, lesson_id=lesson_id)
            db.add(progress)
            db.commit()
            return True
        return False

    def seed_content(self, db: Session):
        """Helper to create initial content if empty"""
        if db.query(models.Module).count() == 0:
            # Module 1
            m1 = models.Module(title="Investing Basics", description="Start here!", order=1)
            db.add(m1)
            db.commit()
            db.refresh(m1)
            
            db.add(models.Lesson(module_id=m1.id, title="What is a Stock?", content="A stock represents ownership in a company...", order=1))
            db.add(models.Lesson(module_id=m1.id, title="Market Orders vs Limit Orders", content="Market orders execute immediately...", order=2))
            
            # Module 2
            m2 = models.Module(title="Technical Analysis 101", description="Reading charts.", order=2)
            db.add(m2)
            db.commit()
            db.refresh(m2)
            
            db.add(models.Lesson(module_id=m2.id, title="Support & Resistance", content="Price levels where the market has trouble breaking through...", order=1))
            db.commit()

education_service = EducationService()
