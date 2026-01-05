from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.backtest_service import backtest_service

router = APIRouter()

class BacktestRequest(BaseModel):
    ticker: str
    initial_capital: float = 10000.0
    rules: List[Dict[str, Any]]
    data: List[Dict[str, Any]]

@router.post("/run")
async def run_backtest(request: BacktestRequest):
    """
    Run a simulation of the strategy.
    """
    try:
        result = backtest_service.run_backtest(
            request.ticker,
            request.rules,
            request.data,
            request.initial_capital
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
