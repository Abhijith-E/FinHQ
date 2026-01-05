from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Any
from app.services.feature_service import feature_service

router = APIRouter()

class TechnicalRequest(BaseModel):
    data: List[Any] # OHLCV data

@router.post("/analyze")
async def analyze_technical(request: TechnicalRequest):
    """
    Perform advanced technical analysis (Patterns, S/R).
    """
    try:
        raw_data = [d.dict() for d in request.data] if hasattr(request.data[0], 'dict') else request.data
        
        patterns = feature_service.detect_candlestick_patterns(raw_data)
        levels = feature_service.calculate_support_resistance(raw_data)
        
        return {
            "patterns": patterns,
            "levels": levels
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
