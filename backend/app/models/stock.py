from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    sector = Column(String)
    industry = Column(String)
    is_active = Column(Boolean, default=True)
    
    prices = relationship("Price", back_populates="stock")
    transactions = relationship("Transaction", back_populates="stock")

class Price(Base):
    __tablename__ = "prices"

    time = Column(DateTime, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), primary_key=True)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Integer, nullable=False)
    
    stock = relationship("Stock", back_populates="prices")

    __table_args__ = (
        Index('idx_price_stock_time', 'stock_id', 'time', unique=True),
    )
