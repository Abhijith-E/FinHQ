"""
Stock Data Service: Handles fetching real market data via Yahoo Finance (yfinance).
Falls back to GBM simulation if yfinance is unavailable.
"""
import random
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from app.core.config import settings

try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False

# Base prices used as fallback for simulation
_BASE_PRICES: Dict[str, float] = {
    "AAPL": 175.0, "MSFT": 380.0, "GOOGL": 140.0, "AMZN": 185.0,
    "TSLA": 250.0, "NVDA": 800.0, "META": 490.0, "BRK.B": 390.0,
    "JPM": 200.0, "V": 280.0, "NFLX": 620.0, "AMD": 155.0,
}

# Map our timeframe identifiers to yfinance parameters
INTERVAL_MAP = {
    "1d":  {"period": "1y",   "interval": "1d"},
    "1h":  {"period": "60d",  "interval": "1h"},
    "15m": {"period": "5d",   "interval": "15m"},
    "30m": {"period": "30d",  "interval": "30m"},
    "1wk": {"period": "5y",   "interval": "1wk"},
}


class StockDataService:
    def __init__(self):
        self._base_prices = _BASE_PRICES.copy()

    def _get_base_price(self, ticker: str) -> float:
        if ticker.upper() not in self._base_prices:
            random.seed(hash(ticker.upper()) % 10000)
            self._base_prices[ticker.upper()] = round(random.uniform(10, 500), 2)
        return self._base_prices[ticker.upper()]

    async def fetch_stock_details(self, ticker: str) -> Dict[str, Any]:
        """Fetch company overview. Uses yfinance if available."""
        if YFINANCE_AVAILABLE:
            try:
                info = yf.Ticker(ticker.upper()).info
                return {
                    "Symbol": info.get("symbol", ticker.upper()),
                    "Name": info.get("longName", ticker.upper()),
                    "Sector": info.get("sector", "N/A"),
                    "Industry": info.get("industry", "N/A"),
                    "Description": info.get("longBusinessSummary", ""),
                    "MarketCapitalization": str(info.get("marketCap", 0)),
                    "Exchange": info.get("exchange", "NASDAQ"),
                }
            except Exception:
                pass  # Fall through to mock

        base = self._get_base_price(ticker)
        sectors = ["Technology", "Financial Services", "Consumer Cyclical", "Healthcare", "Energy"]
        random.seed(hash(ticker.upper()) % 10000)
        return {
            "Symbol": ticker.upper(),
            "Name": f"{ticker.upper()} Corporation",
            "Sector": random.choice(sectors),
            "Industry": "General",
            "Description": f"{ticker.upper()} stock data (live data unavailable).",
            "MarketCapitalization": str(int(base * 1e7)),
            "Exchange": "NASDAQ",
        }

    async def fetch_historical_data(self, ticker: str, limit: int = 200, interval: str = "1d") -> List[Dict[str, Any]]:
        """
        Fetch OHLCV history using yfinance. Falls back to GBM simulation.
        """
        if YFINANCE_AVAILABLE:
            try:
                params = INTERVAL_MAP.get(interval, {"period": "1y", "interval": "1d"})
                df = yf.download(
                    ticker.upper(),
                    period=params["period"],
                    interval=params["interval"],
                    auto_adjust=True,
                    progress=False,
                )
                if df is not None and not df.empty:
                    df = df.tail(limit)
                    results = []
                    for ts, row in df.iterrows():
                        # Handle both DatetimeIndex and string index
                        if hasattr(ts, "strftime"):
                            time_str = ts.strftime("%Y-%m-%d") if params["interval"] in ["1d", "1wk"] else ts.strftime("%Y-%m-%dT%H:%M:%S")
                        else:
                            time_str = str(ts)
                        
                        # yfinance can return MultiIndex columns; flatten
                        def _get(col):
                            try:
                                v = row[col]
                                if hasattr(v, 'item'):
                                    return float(v.item())
                                return float(v)
                            except Exception:
                                return 0.0

                        results.append({
                            "time": time_str,
                            "open": round(_get("Open"), 4),
                            "high": round(_get("High"), 4),
                            "low": round(_get("Low"), 4),
                            "close": round(_get("Close"), 4),
                            "volume": int(_get("Volume")),
                        })
                    return results
            except Exception as e:
                print(f"[yfinance error] {ticker}: {e}")

        # GBM Fallback
        results = []
        base_price = self._get_base_price(ticker)
        current_date = datetime.utcnow()
        mu = 0.0002
        sigma = 0.015
        dates = []
        dt = current_date
        for _ in range(limit):
            while dt.weekday() >= 5:
                dt -= timedelta(days=1)
            dates.append(dt)
            dt -= timedelta(days=1)
        dates.reverse()
        price = base_price
        for date in dates:
            shock = random.gauss(0, 1)
            pct = mu + sigma * shock
            o = price
            c = round(o * (1 + pct), 2)
            h = round(max(o, c) * (1 + random.uniform(0, 0.005)), 2)
            l = round(min(o, c) * (1 - random.uniform(0, 0.005)), 2)
            v = int(random.uniform(500_000, 10_000_000))
            results.append({"time": date.strftime("%Y-%m-%d"), "open": o, "high": h, "low": l, "close": c, "volume": v})
            price = c
        return results

    async def get_live_quote(self, ticker: str) -> Dict[str, Any]:
        """Get live quote using yfinance fast_info."""
        if YFINANCE_AVAILABLE:
            try:
                t = yf.Ticker(ticker.upper())
                fi = t.fast_info
                last = round(float(fi.last_price or 0), 2)
                prev = round(float(fi.previous_close or last), 2)
                change = round(last - prev, 2)
                change_pct = round((change / prev) * 100, 2) if prev else 0.0
                return {
                    "ticker": ticker.upper(),
                    "last": last,
                    "bid": round(last * 0.9998, 2),
                    "ask": round(last * 1.0002, 2),
                    "prev_close": prev,
                    "change": change,
                    "change_pct": change_pct,
                    "volume": int(fi.three_month_average_volume or 0),
                    "market_cap": int(fi.market_cap or 0),
                    "timestamp": datetime.utcnow().isoformat(),
                }
            except Exception as e:
                print(f"[yfinance quote error] {ticker}: {e}")

        # Fallback
        base = self._get_base_price(ticker)
        noise = random.uniform(-0.01, 0.01)
        last_price = round(base * (1 + noise), 2)
        spread = round(last_price * 0.0002, 2)
        prev_close = round(base, 2)
        change = round(last_price - prev_close, 2)
        change_pct = round((change / prev_close) * 100, 2)
        return {
            "ticker": ticker.upper(),
            "last": last_price,
            "bid": round(last_price - spread, 2),
            "ask": round(last_price + spread, 2),
            "prev_close": prev_close,
            "change": change,
            "change_pct": change_pct,
            "volume": int(random.uniform(500_000, 10_000_000)),
            "market_cap": 0,
            "timestamp": datetime.utcnow().isoformat(),
        }

    async def get_market_movers(self) -> Dict[str, List]:
        """Get top gainers and losers (simulated for speed)."""
        tickers = list(self._base_prices.keys())
        gainers, losers = [], []
        for ticker in tickers:
            base = self._get_base_price(ticker)
            pct = round(random.uniform(-5, 5), 2)
            item = {"ticker": ticker, "change_pct": pct, "price": round(base * (1 + pct / 100), 2)}
            if pct > 0:
                gainers.append(item)
            else:
                losers.append(item)
        gainers.sort(key=lambda x: x["change_pct"], reverse=True)
        losers.sort(key=lambda x: x["change_pct"])
        return {"gainers": gainers[:5], "losers": losers[:5]}


stock_data_service = StockDataService()
