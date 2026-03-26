from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.risk_service import risk_service

router = APIRouter()

class RiskRequest(BaseModel):
    holdings: List[Dict[str, Any]] # e.g. [{"ticker": "RELIANCE.NS", "value": 1000}, ...]
    history_data: Dict[str, List[Any]] # e.g. {"RELIANCE.NS": [{...}, ...], ...}

@router.post("/analyze")
async def analyze_risk(request: RiskRequest):
    """
    Calculate portfolio risk metrics (VaR, Volatility, Sharpe).
    """
    try:
        # Convert Pydantic models to dict if necessary (though List[Any] handles it mostly)
        # If history_data items are objects, we might need traversal.
        # Assuming simple dict structure for flexibility or list of dicts.
        
        result = risk_service.calculate_portfolio_risk(
            request.holdings,
            request.history_data
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
