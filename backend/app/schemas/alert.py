from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from enum import Enum

class AlertCondition(str, Enum):
    ABOVE = "ABOVE"
    BELOW = "BELOW"

class AlertStatus(str, Enum):
    ACTIVE = "ACTIVE"
    TRIGGERED = "TRIGGERED"
    DISABLED = "DISABLED"

# Shared properties
class AlertBase(BaseModel):
    ticker: str
    condition: AlertCondition
    target_price: float

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: int
    user_id: int
    status: AlertStatus
    created_at: datetime
    triggered_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class NotificationBase(BaseModel):
    title: str
    message: str

class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
