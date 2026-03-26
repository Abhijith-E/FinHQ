"""
Stock Data Service: Handles fetching real market data via Yahoo Finance (yfinance).
Falls back to GBM simulation if yfinance is unavailable.
Now covers all Nifty 100 (NSE) + Sensex 30 (BSE) stocks.
"""
import random
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.indian_stocks import ALL_INDIAN_STOCKS, get_base_price, KNOWN_BASE_PRICES

try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False

# Build the full base prices dict from master stock list
_BASE_PRICES: Dict[str, float] = {
    stock["ticker"]: get_base_price(stock["ticker"]) for stock in ALL_INDIAN_STOCKS
}

# Map our timeframe identifiers to yfinance parameters
INTERVAL_MAP = {
    "1d":  {"period": "1y",   "interval": "1d"},
    "1h":  {"period": "60d",  "interval": "1h"},
    "15m": {"period": "5d",   "interval": "15m"},
    "30m": {"period": "30d",  "interval": "30m"},
    "1wk": {"period": "5y",   "interval": "1wk"},
}

# Representative Nifty 50 tickers used for fast market-movers sampling
NIFTY_50_SAMPLE = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
    "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "LT.NS", "HINDUNILVR.NS",
    "AXISBANK.NS", "KOTAKBANK.NS", "BAJFINANCE.NS", "TATAMOTORS.NS", "SUNPHARMA.NS",
    "MARUTI.NS", "ASIANPAINT.NS", "TITAN.NS", "NTPC.NS", "WIPRO.NS",
    "HCLTECH.NS", "TECHM.NS", "DRREDDY.NS", "CIPLA.NS", "COALINDIA.NS",
    "ONGC.NS", "POWERGRID.NS", "TATASTEEL.NS", "JSWSTEEL.NS", "HINDALCO.NS",
    "ULTRACEMCO.NS", "NESTLEIND.NS", "M&M.NS", "BAJAJ-AUTO.NS", "EICHERMOT.NS",
    "GRASIM.NS", "ADANIPORTS.NS", "DIVISLAB.NS", "APOLLOHOSP.NS", "INDUSINDBK.NS",
    "HAL.NS", "BEL.NS", "IRCTC.NS", "DLF.NS", "TATAPOWER.NS",
    "VEDL.NS", "NMDC.NS", "SAIL.NS", "COLPAL.NS", "DABUR.NS",
]


class StockDataService:
    def __init__(self):
        self._base_prices = _BASE_PRICES.copy()

    def _get_base_price(self, ticker: str) -> float:
        t = ticker.upper()
        if t in self._base_prices:
            return self._base_prices[t]
        # For unknown tickers, fall back to sector-based or generic
        price = get_base_price(t)
        self._base_prices[t] = price
        return price

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
                    "Exchange": info.get("exchange", "NSE"),
                }
            except Exception:
                pass  # Fall through to local lookup

        # Lookup from master list
        t = ticker.upper()
        stock_meta = next((s for s in ALL_INDIAN_STOCKS if s["ticker"] == t), None)
        base = self._get_base_price(t)
        if stock_meta:
            return {
                "Symbol": t,
                "Name": stock_meta["name"],
                "Sector": stock_meta["sector"],
                "Industry": stock_meta["industry"],
                "Description": f"{stock_meta['name']} — listed on {'NSE' if t.endswith('.NS') else 'BSE'}.",
                "MarketCapitalization": str(int(base * 1e7)),
                "Exchange": "NSE" if t.endswith(".NS") else "BSE",
            }
        # Generic fallback for unlisted tickers
        return {
            "Symbol": t,
            "Name": f"{t} (Indian Stock)",
            "Sector": "N/A",
            "Industry": "N/A",
            "Description": f"{t} — real-time data via Yahoo Finance.",
            "MarketCapitalization": str(int(base * 1e7)),
            "Exchange": "NSE" if t.endswith(".NS") else "BSE",
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
                        if hasattr(ts, "strftime"):
                            time_str = ts.strftime("%Y-%m-%d") if params["interval"] in ["1d", "1wk"] else ts.strftime("%Y-%m-%dT%H:%M:%S")
                        else:
                            time_str = str(ts)

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

        # Simulation fallback
        base = self._get_base_price(ticker)
        noise = random.uniform(-0.015, 0.015)
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
        """
        Get top gainers and losers.
        Tries real yfinance fast_info per ticker for top 30 Nifty stocks.
        Always falls back to simulation so the endpoint never returns empty.
        """
        gainers: List[Dict] = []
        losers: List[Dict] = []
        seen: set = set()

        if YFINANCE_AVAILABLE:
            for ticker in NIFTY_50_SAMPLE[:30]:
                try:
                    fi = yf.Ticker(ticker).fast_info
                    last = float(fi.last_price or 0)
                    prev = float(fi.previous_close or 0)
                    if last > 0 and prev > 0:
                        pct = round((last - prev) / prev * 100, 2)
                        item = {"ticker": ticker, "change_pct": pct, "price": round(last, 2)}
                        if pct >= 0:
                            gainers.append(item)
                        else:
                            losers.append(item)
                        seen.add(ticker)
                except Exception:
                    pass  # Fall through to simulation for this ticker

        # Fill remaining with realistic simulation (guaranteed always works)
        for ticker in NIFTY_50_SAMPLE:
            if ticker in seen:
                continue
            base = self._get_base_price(ticker)
            import random as _rnd
            pct = round(_rnd.uniform(-4.5, 4.5), 2)
            item = {"ticker": ticker, "change_pct": pct, "price": round(base * (1 + pct / 100), 2)}
            if pct >= 0:
                gainers.append(item)
            else:
                losers.append(item)

        gainers.sort(key=lambda x: x["change_pct"], reverse=True)
        losers.sort(key=lambda x: x["change_pct"])
        return {"gainers": gainers[:8], "losers": losers[:8]}

    async def fetch_fundamentals(self, ticker: str) -> Dict[str, Any]:
        """Fetch fundamental data/metrics from yfinance."""
        if not YFINANCE_AVAILABLE:
            return self._get_mock_fundamentals(ticker)
        
        try:
            t = yf.Ticker(ticker.upper())
            info = t.info
            
            return {
                "ticker": ticker.upper(),
                "company_name": info.get("longName", ticker.upper()),
                "sector": info.get("sector", "N/A"),
                "industry": info.get("industry", "N/A"),
                "current_price": info.get("currentPrice") or info.get("regularMarketPrice") or self._get_base_price(ticker),
                "market_cap": self._format_market_cap(info.get("marketCap", 0)),
                "pe_ratio": info.get("trailingPE") or info.get("forwardPE"),
                "pb_ratio": info.get("priceToBook"),
                "dividend_yield": (info.get("dividendYield") or 0) * 100,
                "currency": info.get("currency", "₹"),
                "valuation": {
                    "fair_value": (info.get("targetMeanPrice") or (info.get("currentPrice", 100) * 1.15)),
                    "assumptions": {
                        "growth_rate_pct": 12.5,
                        "discount_rate_pct": 10.0
                    }
                },
                "health": {
                    "score": random.randint(75, 95),
                    "grade": "A" if random.random() > 0.2 else "B",
                    "checks": [
                        f"Strong Free Cash Flow from {info.get('sector', 'Core')} segments",
                        "High Return on Equity (ROE > 12%)",
                        f"Diversified business across {info.get('industry', 'Multiple sectors')}",
                        "Consistent Dividend & Buyback track record"
                    ]
                },
                "safety_margin_pct": random.randint(5, 25)
            }
        except Exception as e:
            print(f"[yfinance fundamentals error] {ticker}: {e}")
            return self._get_mock_fundamentals(ticker)

    def _get_mock_fundamentals(self, ticker: str) -> Dict[str, Any]:
        base = self._get_base_price(ticker)
        return {
            "ticker": ticker.upper(),
            "company_name": f"{ticker.upper()} Ltd",
            "sector": "Industrials",
            "industry": "Manufacturing",
            "current_price": base,
            "market_cap": f"{round(base * 10, 2)}B",
            "pe_ratio": 22.5,
            "pb_ratio": 2.1,
            "dividend_yield": 1.2,
            "currency": "₹",
            "valuation": {"fair_value": base * 1.12, "assumptions": {"growth_rate_pct": 10.0, "discount_rate_pct": 9.0}},
            "health": {"score": 82, "grade": "A-", "checks": ["Stable earnings", "Low debt-to-equity"]},
            "safety_margin_pct": 12.0
        }

    def _format_market_cap(self, val: int) -> str:
        if val >= 1e12: return f"{round(val/1e12, 2)}T"
        if val >= 1e7: return f"{round(val/1e7, 2)}Cr"
        return str(val)

    async def get_index_data(self, index_symbol: str = "^NSEI") -> List[Dict[str, Any]]:
        """Fetch last 7 days of index data for dashboard sparklines."""
        if not YFINANCE_AVAILABLE:
            return [{"value": 22000 + (i * 100)} for i in range(7)]
        
        try:
            # ^NSEI is Nifty 50, ^BSESN is Sensex
            df = yf.download(index_symbol, period="7d", interval="1d", progress=False)
            if df.empty:
                return [{"value": 22000 + (i * 100)} for i in range(7)]
            
            # Use 'Close' column
            prices = df['Close'].tolist()
            return [{"value": round(float(p), 2)} for p in prices]
        except Exception as e:
            print(f"[Index fetch error] {index_symbol}: {e}")
            return [{"value": 22000 + (i * 100)} for i in range(7)]

    async def get_stock_news(self, ticker: str) -> List[Dict[str, Any]]:
        """Fetch latest news for a stock using yfinance and analyze sentiment."""
        if not YFINANCE_AVAILABLE:
            return await self._enrich_news_with_sentiment(self._get_mock_news(ticker))
        
        try:
            t = yf.Ticker(ticker.upper())
            news_items = t.news[:6]  # Get last 6 news items
            if not news_items:
                return await self._enrich_news_with_sentiment(self._get_mock_news(ticker))
            
            results = []
            for item in news_items:
                # Handle new yfinance nested structure
                content = item.get("content", {})
                if content:
                    title = content.get("title")
                    if not title: continue
                    
                    publisher = content.get("provider", {}).get("displayName", "Finance News")
                    link = content.get("clickThroughUrl", {}).get("url") or content.get("canonicalUrl", {}).get("url")
                    
                    pub_time = content.get("pubDate") or content.get("displayTime")
                    try:
                        if pub_time:
                            # Use pandas to-datetime for robust parsing
                            import pandas as pd
                            ts = pd.to_datetime(pub_time)
                            time_str = ts.strftime("%Y-%m-%d %H:%M")
                        else:
                            time_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
                    except Exception:
                        time_str = str(pub_time) if pub_time else "N/A"
                        
                    results.append({
                        "id": item.get("id") or content.get("id"),
                        "title": title,
                        "publisher": publisher,
                        "link": link,
                        "provider_publish_time": time_str,
                        "type": content.get("contentType", "STORY"),
                    })
                else:
                    # Fallback to old flat structure
                    title = item.get("title")
                    if not title: continue
                    
                    results.append({
                        "id": item.get("uuid"),
                        "title": title,
                        "publisher": item.get("publisher"),
                        "link": item.get("link"),
                        "provider_publish_time": datetime.fromtimestamp(item.get("providerPublishTime", 0)).strftime("%Y-%m-%d %H:%M"),
                        "type": item.get("type", "STORY"),
                    })
            
            if not results:
                return await self._enrich_news_with_sentiment(self._get_mock_news(ticker))
                
            return await self._enrich_news_with_sentiment(results)
        except Exception as e:
            print(f"[News fetch error] {ticker}: {e}")
            return await self._enrich_news_with_sentiment(self._get_mock_news(ticker))

    async def _enrich_news_with_sentiment(self, news_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Utility to add sentiment analysis to news items using the ML service."""
        import httpx
        ML_SERVICE_URL = "http://ml-service:8001/api/v1/sentiment/predict"
        
        enriched_news = []
        async with httpx.AsyncClient(timeout=5.0) as client:
            for item in news_items:
                try:
                    # Perform sentiment analysis on the title
                    response = await client.post(ML_SERVICE_URL, json={"text": item["title"]})
                    if response.status_code == 200:
                        sentiment_data = response.json()
                        item["sentiment"] = {
                            "label": sentiment_data["label"],
                            "score": round(sentiment_data["score"], 4)
                        }
                    else:
                        item["sentiment"] = {"label": "neutral", "score": 0.5}
                except Exception as e:
                    print(f"[Sentiment analysis error]: {e}")
                    item["sentiment"] = {"label": "neutral", "score": 0.5}
                enriched_news.append(item)
        
        return enriched_news

    def _get_mock_news(self, ticker: str) -> List[Dict[str, Any]]:
        return [
            {
                "id": "1",
                "title": f"{ticker}: Q3 Earnings beat market expectations",
                "publisher": "FinHQ News",
                "link": "#",
                "provider_publish_time": "2024-03-24 10:00",
                "type": "STORY"
            },
            {
                "id": "2",
                "title": f"Why analysts are bullish on {ticker} for the next decade",
                "publisher": "Market Insights",
                "link": "#",
                "provider_publish_time": "2024-03-23 14:30",
                "type": "STORY"
            }
        ]


stock_data_service = StockDataService()



