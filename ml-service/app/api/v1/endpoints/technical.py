from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Any, Optional

from app.services.pattern_detection_service import pattern_detection_service
from app.services.feature_service import feature_service
from app.services.pattern_history_store import history_store

router = APIRouter()


class TechnicalRequest(BaseModel):
    data: List[Any]             # OHLCV data
    timeframe: str = "1D"
    min_confidence: float = 40.0


@router.post("/analyze")
async def analyze_technical(request: TechnicalRequest):
    """
    Full AI pattern detection endpoint (ensemble: algorithmic + CNN+Transformer).
    Called by the frontend's fetchAdvancedPatterns().
    Returns patterns in the format { patterns: [...], levels: {...} }
    """
    try:
        raw_data = (
            [d.dict() for d in request.data]
            if request.data and hasattr(request.data[0], "dict")
            else request.data
        )

        if len(raw_data) < 10:
            return {"patterns": [], "levels": {}}

        # ── AI Ensemble Detection ────────────────────────────────────────────
        patterns = pattern_detection_service.detect_with_confidence_calibration(
            raw_data,
            timeframe=request.timeframe,
            min_confidence=request.min_confidence,
        )

        # ── Algorithmic S/R Levels ───────────────────────────────────────────
        levels = feature_service.calculate_support_resistance(raw_data)

        # ── History ─────────────────────────────────────────────────────────
        try:
            history_store.add("unknown", request.timeframe, patterns)
        except Exception:
            pass

        return {
            "patterns": patterns,   # enriched AI detections
            "levels": levels,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
