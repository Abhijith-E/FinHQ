from transformers import pipeline
import torch
from typing import Dict, Any

class SentimentService:
    def __init__(self):
        # Lazy loading of model to avoid startup delay if not needed immediately
        self.analyzer = None

    def _load_model(self):
        if not self.analyzer:
            print("Loading FinBERT model...")
            # Use CPU by default, use device=0 if GPU available
            self.analyzer = pipeline("sentiment-analysis", model="ProsusAI/finbert")
            print("FinBERT model loaded.")

    def predict_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Predict sentiment of a given text using FinBERT.
        Returns label (positive, negative, neutral) and score.
        """
        self._load_model()
        # Truncate to 512 tokens to fit BERT limit
        results = self.analyzer(text[:512], truncation=True, padding=True)
        if results:
            return results[0]
        return {"label": "neutral", "score": 0.0}

sentiment_service = SentimentService()
