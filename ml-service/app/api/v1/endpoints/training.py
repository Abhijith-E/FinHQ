from fastapi import APIRouter
from app.services.training_service import training_service
from app.services.feature_service import feature_service
from typing import List, Any
from pydantic import BaseModel

router = APIRouter()

class TrainRequest(BaseModel):
    ticker: str
    data: List[Any] # Raw OHLCV data

@router.post("/train")
async def train_model(request: TrainRequest):
    """
    Trigger a training run for a specific stock.
    """
    result = training_service.train_price_model(request.ticker, request.data)
    return result
