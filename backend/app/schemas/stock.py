from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

# Price Schemas
class PriceBase(BaseModel):
    open: float
    high: float
    low: float
    close: float
    volume: int
    time: datetime

class PriceCreate(PriceBase):
    pass

class Price(PriceBase):
    stock_id: int

    class Config:
        from_attributes = True

# Stock Schemas
class StockBase(BaseModel):
    ticker: str
    name: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    is_active: Optional[bool] = True

class StockCreate(StockBase):
    pass

class Stock(StockBase):
    id: int
    prices: List[Price] = []

    class Config:
        from_attributes = True
