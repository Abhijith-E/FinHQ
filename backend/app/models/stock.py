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
    exchange = Column(String)
    market_cap = Column(Float)
    description = Column(String)
    is_active = Column(Boolean, default=True)
    
    prices = relationship("OHLCVData", back_populates="stock")
    transactions = relationship("Transaction", back_populates="stock")
    fundamentals = relationship("FundamentalData", back_populates="stock", uselist=False)
    positions = relationship("Position", back_populates="stock")

class OHLCVData(Base):
    __tablename__ = "ohlcv_data"

    time = Column(DateTime, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), primary_key=True)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Integer, nullable=False)
    
    stock = relationship("Stock", back_populates="prices")

    __table_args__ = (
        Index('idx_ohlcv_stock_time', 'stock_id', 'time', unique=True),
    )

class FundamentalData(Base):
    __tablename__ = "fundamental_data"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False, unique=True)
    pe_ratio = Column(Float)
    pb_ratio = Column(Float)
    ps_ratio = Column(Float)
    ev_ebitda = Column(Float)
    debt_equity = Column(Float)
    roe = Column(Float)
    roa = Column(Float)
    current_ratio = Column(Float)
    quick_ratio = Column(Float)
    health_score = Column(Float)

    stock = relationship("Stock", back_populates="fundamentals")
