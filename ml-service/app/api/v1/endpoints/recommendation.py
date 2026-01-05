from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Any, Optional
from app.services.recommendation_service import recommendation_service

router = APIRouter()

class AnalyzeRequest(BaseModel):
    ticker: str
    data: List[Any] # OHLCV Data
    news_text: Optional[str] = None # Optional latest news for context

@router.post("/analyze")
async def analyze_stock(request: AnalyzeRequest):
    """
    Analyze a stock using multiple signals to generate a recommendation.
    """
    try:
        raw_data = [d.dict() for d in request.data] if hasattr(request.data[0], 'dict') else request.data
        result = recommendation_service.generate_recommendation(
            request.ticker, 
            raw_data, 
            request.news_text
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
