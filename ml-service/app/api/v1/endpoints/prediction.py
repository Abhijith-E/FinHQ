from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Any
from app.services.prediction_service import prediction_service

router = APIRouter()

class TrainRequest(BaseModel):
    ticker: str
    data: List[Any]

class ForecastRequest(BaseModel):
    ticker: str
    data: List[Any]

@router.post("/train")
async def train_lstm(request: TrainRequest):
    """
    Train the LSTM model on historical data.
    """
    try:
        raw_data = [d.dict() for d in request.data] if hasattr(request.data[0], 'dict') else request.data
        result = prediction_service.train_lstm_model(request.ticker, raw_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/forecast")
async def forecast_price(request: ForecastRequest):
    """
    Get the next day's price prediction.
    """
    try:
        raw_data = [d.dict() for d in request.data] if hasattr(request.data[0], 'dict') else request.data
        price = prediction_service.predict_next_price(raw_data)
        return {"ticker": request.ticker, "predicted_price": price}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
