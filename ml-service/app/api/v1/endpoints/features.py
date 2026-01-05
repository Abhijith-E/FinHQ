from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.feature_service import feature_service

router = APIRouter()

class OHLCVData(BaseModel):
    time: Optional[Any] = None
    open: float
    high: float
    low: float
    close: float
    volume: float

class FeatureRequest(BaseModel):
    data: List[OHLCVData]

@router.post("/calculate")
async def calculate_features(request: FeatureRequest):
    """
    Accepts raw OHLCV data and returns data enriched with technical indicators.
    """
    try:
        # Convert Pydantic models to dicts
        raw_data = [d.dict() for d in request.data]
        if not raw_data:
            raise HTTPException(status_code=400, detail="No data provided")
            
        enriched_data = feature_service.calculate_technical_indicators(raw_data)
        return enriched_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
