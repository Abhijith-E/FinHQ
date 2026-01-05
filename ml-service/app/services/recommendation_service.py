from typing import List, Dict, Any
import numpy as np
from app.services.feature_service import feature_service
from app.services.sentiment_service import sentiment_service
from app.services.prediction_service import prediction_service

class RecommendationService:
    def generate_recommendation(self, ticker: str, raw_data: List[Dict[str, Any]], news_text: str = None) -> Dict[str, Any]:
        """
        Aggregates Technicals, Sentiment, and AI Prediction to generate a recommendation.
        """
        score = 0.0
        rationale = []
        
        # 1. Technical Analysis (40% Weight)
        technicals = feature_service.calculate_technical_indicators(raw_data)
        if not technicals:
            return {"action": "HOLD", "score": 0.0, "rationale": "Insufficient data"}
            
        latest = technicals[-1]
        rsi = latest.get("momentum_rsi", 50)
        macd = latest.get("trend_macd", 0)
        macd_signal = latest.get("trend_macd_signal", 0)
        
        # RSI Logic
        if rsi > 70:
            score -= 0.2  # Overbought
            rationale.append("RSI indicates Overbought (Potential Sell)")
        elif rsi < 30:
            score += 0.2  # Oversold
            rationale.append("RSI indicates Oversold (Potential Buy)")
        else:
            rationale.append("RSI is Neutral")
            
        # MACD Logic
        if macd > macd_signal:
            score += 0.2
            rationale.append("MACD Bullish Crossover")
        else:
            score -= 0.2
            rationale.append("MACD Bearish Trend")
            
        # 2. Sentiment Analysis (30% Weight)
        if news_text:
            sentiment = sentiment_service.predict_sentiment(news_text)
            label = sentiment["label"]
            conf = sentiment["score"]
            
            if label == "positive":
                impact = 0.3 * conf
                score += impact
                rationale.append(f"Positive News Sentiment ({int(conf*100)}%)")
            elif label == "negative":
                impact = 0.3 * conf
                score -= impact
                rationale.append(f"Negative News Sentiment ({int(conf*100)}%)")
        else:
            rationale.append("No News Sentiment Available")
            
        # 3. AI Prediction (30% Weight)
        current_price = raw_data[-1]["close"]
        predicted_price = prediction_service.predict_next_price(raw_data)
        
        if predicted_price > 0:
            pct_change = (predicted_price - current_price) / current_price
            
            if pct_change > 0.02: # > 2% gain predicted
                score += 0.3
                rationale.append(f"AI Predicts Price Increase (+{pct_change*100:.1f}%)")
            elif pct_change < -0.02: # > 2% loss predicted
                score -= 0.3
                rationale.append(f"AI Predicts Price Decrease ({pct_change*100:.1f}%)")
            else:
                rationale.append("AI Predicts Flat Movement")
        
        # Final Decision
        action = "HOLD"
        if score >= 0.3:
            action = "BUY"
        elif score <= -0.3:
            action = "SELL"
            
        return {
            "ticker": ticker,
            "action": action,
            "score": round(score, 2),
            "rationale": "; ".join(rationale),
            "details": {
                "rsi": rsi,
                "ai_prediction": predicted_price
            }
        }

recommendation_service = RecommendationService()
