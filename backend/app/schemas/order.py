from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from enum import Enum

class OrderType(str, Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"

class OrderSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    FILLED = "FILLED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"

# Shared properties
class OrderBase(BaseModel):
    ticker: str
    type: OrderType = OrderType.MARKET
    side: OrderSide
    quantity: int
    price: Optional[float] = None

# Properties to receive on Creation
class OrderCreate(OrderBase):
    pass

# Properties shared by models stored in DB
class OrderInDBBase(OrderBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    status: OrderStatus
    filled_avg_price: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

# Properties to return to client
class Order(OrderInDBBase):
    pass
