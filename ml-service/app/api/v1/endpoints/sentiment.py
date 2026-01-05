from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.sentiment_service import sentiment_service

router = APIRouter()

class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    label: str
    score: float

@router.post("/predict", response_model=SentimentResponse)
async def predict_sentiment(request: SentimentRequest):
    """
    Predict sentiment of a text snippet using FinBERT.
    """
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    result = sentiment_service.predict_sentiment(request.text)
    return SentimentResponse(label=result["label"], score=result["score"])
