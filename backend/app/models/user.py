from sqlalchemy import Boolean, Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.db.base import Base

class RiskProfile(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # New auth and profile fields
    is_verified = Column(Boolean, default=False)
    is_2fa_enabled = Column(Boolean, default=False)
    totp_secret = Column(String, nullable=True)
    
    failed_login_attempts = Column(Integer, default=0)
    lockout_until = Column(DateTime, nullable=True)
    password_changed_at = Column(DateTime, default=datetime.utcnow)
    
    risk_profile = Column(Enum(RiskProfile), default=RiskProfile.MEDIUM)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    # Relationships are handled via backrefs in other models or explicitly here
    password_history = relationship("PasswordHistory", back_populates="user", order_by="desc(PasswordHistory.created_at)")
    sessions = relationship("UserSession", back_populates="user")
    strategies = relationship("Strategy", back_populates="owner")
    orders = relationship("Order", back_populates="owner")
    alerts = relationship("Alert", back_populates="owner")
    notifications = relationship("Notification", back_populates="owner")
    posts = relationship("Post", back_populates="owner")
    comments = relationship("Comment", back_populates="owner")
    progress = relationship("UserProgress", back_populates="owner")
