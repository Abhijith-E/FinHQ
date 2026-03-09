from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    order = Column(Integer, default=0)
    
    lessons = relationship("Lesson", back_populates="module", order_by="Lesson.order")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False) # Markdown content
    order = Column(Integer, default=0)
    duration_minutes = Column(Integer, default=5)

    module = relationship("Module", back_populates="lessons")

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="progress")
    lesson = relationship("Lesson")

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", backref="enrollments")
    module = relationship("Module", backref="enrollments")

from sqlalchemy.dialects.postgresql import JSONB

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    question = Column(String, nullable=False)
    options = Column(JSONB, nullable=False) # list of options
    correct_answer_index = Column(Integer, nullable=False)

    lesson = relationship("Lesson", backref="quizzes")

class QuizSubmission(Base):
    __tablename__ = "quiz_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="quiz_submissions")
    quiz = relationship("Quiz", backref="submissions")
