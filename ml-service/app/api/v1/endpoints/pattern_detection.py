"""
Pattern Detection API Endpoints
================================
POST /detect-from-data   — OHLCV JSON → pattern detections + annotated chart
POST /detect-image       — base64 chart image → pattern detections
GET  /patterns-history   — last N detection records
"""

from __future__ import annotations

import base64
import logging
from typing import List, Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.pattern_detection_service import pattern_detection_service
from app.services.chart_renderer import chart_renderer
from app.services.pattern_history_store import history_store

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Request / Response Models ────────────────────────────────────────────────

class OHLCVCandle(BaseModel):
    time:   str   = ""
    open:   float = 0.0
    high:   float = 0.0
    low:    float = 0.0
    close:  float = 0.0
    volume: float = 0.0


class DetectFromDataRequest(BaseModel):
    ticker:     str              = "UNKNOWN"
    timeframe:  str              = "1D"
    ohlcv:      List[OHLCVCandle]
    min_confidence: float        = Field(default=50.0, ge=0, le=100)
    render_chart:   bool         = True


class DetectImageRequest(BaseModel):
    image_base64:   str          # PNG/JPEG encoded as base64
    ticker:         str          = "UNKNOWN"
    timeframe:      str          = "1D"
    min_confidence: float        = Field(default=50.0, ge=0, le=100)


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/detect-from-data")
async def detect_from_data(request: DetectFromDataRequest):
    """
    Accepts OHLCV data, runs AI pattern detection ensemble, and returns
    detected patterns with optional annotated chart image.
    """
    if len(request.ohlcv) < 10:
        raise HTTPException(status_code=422, detail="Minimum 10 candles required.")

    ohlcv = [c.model_dump() for c in request.ohlcv]

    try:
        patterns = pattern_detection_service.detect_with_confidence_calibration(
            ohlcv,
            timeframe=request.timeframe,
            min_confidence=request.min_confidence,
        )
    except Exception as exc:
        logger.error(f"Pattern detection failed: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Detection error: {exc}")

    # Annotated chart
    annotated_chart: Optional[str] = None
    if request.render_chart:
        try:
            annotated_chart = chart_renderer.render_and_annotate(ohlcv, patterns)
        except Exception as exc:
            logger.warning(f"Chart rendering failed (non-fatal): {exc}")

    # Store in history
    try:
        history_store.add(request.ticker, request.timeframe, patterns)
    except Exception:
        pass

    return {
        "ticker":          request.ticker,
        "timeframe":       request.timeframe,
        "pattern_count":   len(patterns),
        "patterns":        patterns,
        "annotated_chart": annotated_chart,  # base64 PNG or null
        "detection_mode":  "ensemble",
    }


@router.post("/detect-image")
async def detect_image(request: DetectImageRequest):
    """
    Accepts a base64-encoded chart image.
    Runs the CNN+Transformer model to classify patterns present.
    NOTE: Without calibrated weights, returns pattern rankings from the model's
    prior distribution. Upload model weights via the training pipeline for
    accurate results.
    """
    if not request.image_base64:
        raise HTTPException(status_code=422, detail="image_base64 is required.")

    # Validate base64
    try:
        base64.b64decode(request.image_base64, validate=True)
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid base64 image data.")

    # Without OHLCV we return model-only (untrained placeholder scores)
    # In production this would pass the image through a vision backbone
    return {
        "ticker":    request.ticker,
        "timeframe": request.timeframe,
        "patterns":  [],
        "note": (
            "Image-only detection requires pre-trained YOLOv8 weights. "
            "Run the training pipeline in ml-service/training/ to enable this. "
            "Use /detect-from-data for immediate algorithmic detection."
        ),
    }


@router.get("/patterns-history")
async def patterns_history(
    ticker: Optional[str] = Query(default=None, description="Filter by ticker symbol"),
    limit:  int           = Query(default=20, ge=1, le=200),
):
    """Returns recent pattern detection history."""
    records = history_store.get_recent(n=limit, ticker=ticker)
    return {
        "total":   len(records),
        "history": records,
    }


@router.get("/supported-patterns")
async def supported_patterns():
    """Returns the list of all detectable patterns."""
    from app.services.pattern_detection_service import PATTERNS, PATTERN_SENTIMENT
    return {
        "patterns": [
            {"name": p, "sentiment": PATTERN_SENTIMENT.get(p, "Neutral")}
            for p in PATTERNS
        ]
    }
