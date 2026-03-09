from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from sqlalchemy.dialects.postgresql import JSONB

class MLPrediction(Base):
    __tablename__ = "ml_predictions"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    model_name = Column(String, nullable=False)
    target_date = Column(DateTime(timezone=True), nullable=False)
    predicted_price = Column(Float, nullable=False)
    confidence_interval_low = Column(Float)
    confidence_interval_high = Column(Float)
    features_importance = Column(JSONB) # SHAP values
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stock = relationship("Stock", backref="predictions")
