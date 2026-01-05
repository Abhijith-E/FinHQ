import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import random

class StockDataService:
    def __init__(self):
        self.base_url = "https://www.alphavantage.co/query"
        # In a real app, inject this via settings
        self.api_key = "DEMO" 

    async def fetch_stock_details(self, ticker: str) -> Dict[str, Any]:
        """
        Fetch company overview.
        For demo/no-key, returns mock data if ticker is AAPL/GOOG etc or generic mock.
        """
        # Mock response for development without key
        if self.api_key == "DEMO":
            return {
                "Symbol": ticker.upper(),
                "Name": f"{ticker.upper()} Corp",
                "Sector": "Technology",
                "Industry": "Consumer Electronics",
                "Description": "Mock description for development."
            }
            
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.base_url,
                params={
                    "function": "OVERVIEW",
                    "symbol": ticker,
                    "apikey": self.api_key
                }
            )
            data = response.json()
            return data

    async def fetch_historical_data(self, ticker: str) -> List[Dict[str, Any]]:
        """
        Fetch daily historical data.
        Returns mock data for demo.
        """
        # Generate mock candles for the last 30 days
        results = []
        base_price = 150.0
        current_date = datetime.now()
        
        for i in range(30):
            date = current_date - timedelta(days=i)
            # Simple random walk
            change = random.uniform(-2, 2)
            open_p = base_price
            close_p = base_price + change
            high_p = max(open_p, close_p) + random.uniform(0, 1)
            low_p = min(open_p, close_p) - random.uniform(0, 1)
            
            results.append({
                "time": date,
                "open": round(open_p, 2),
                "high": round(high_p, 2),
                "low": round(low_p, 2),
                "close": round(close_p, 2),
                "volume": int(random.uniform(1000000, 5000000))
            })
            base_price = close_p
            
        return results

stock_data_service = StockDataService()
