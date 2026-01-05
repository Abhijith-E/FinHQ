from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.fundamental_service import fundamental_service

router = APIRouter()

class FundamentalRequest(BaseModel):
    ticker: str
    financials: Dict[str, Any] # Map of needed financial inputs

@router.post("/analyze")
async def analyze_fundamental(request: FundamentalRequest):
    """
    Perform Fundamental Analysis (DCF Valuation + Health Score).
    """
    try:
        valuation = fundamental_service.calculate_dcf(request.ticker, request.financials)
        health = fundamental_service.calculate_health_score(request.financials)
        
        # Calculate Safety Margin
        current_price = request.financials.get("current_price", 0)
        fair_value = valuation.get("fair_value", 0)
        margin = 0
        if current_price > 0 and fair_value > 0:
            margin = (fair_value - current_price) / current_price
            
        return {
            "ticker": request.ticker,
            "current_price": current_price,
            "valuation": valuation,
            "health": health,
            "safety_margin_pct": round(margin * 100, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
