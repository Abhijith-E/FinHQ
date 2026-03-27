"""
Enhanced Stocks API: OHLCV data, indicators, search, and fundamental data.
Includes TimescaleDB time-bucket querying and server-side indicator calculation.

ROUTE ORDER IS CRITICAL: Specific paths (/search, /market-movers, /index-stocks)
MUST come before the parameterised path (/{ticker}) or FastAPI will treat them
as ticker values and the correct handler will never be reached.
"""
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from datetime import datetime, timedelta
import pandas as pd

from app import schemas, models
from app.api import deps
from app.db.session import get_db
from app.services.stock_data_service import stock_data_service
from app.core.indian_stocks import ALL_INDIAN_STOCKS

router = APIRouter()


# ─── Non-parametric routes FIRST ────────────────────────────────────────────

@router.get("/search", response_model=List[schemas.StockSummary])
async def search_stocks(
    q: str = Query(..., min_length=1, description="Search query (ticker or company name)"),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Search for stocks by ticker or company name.
    First searches the DB, then falls back to the master index list.
    """
    stmt = select(models.Stock).where(
        (models.Stock.ticker.ilike(f"%{q}%")) | (models.Stock.name.ilike(f"%{q}%"))
    ).limit(30)
    result = await db.execute(stmt)
    db_stocks = list(result.scalars().all())

    # Supplement DB results with master index (stocks not yet seeded)
    db_tickers = {s.ticker for s in db_stocks}
    q_lower = q.lower()
    extra = [
        schemas.StockSummary(
            id=0,
            ticker=s["ticker"],
            name=s["name"],
            sector=s.get("sector", "N/A"),
            industry=s.get("industry", "N/A"),
            is_active=True,
        )
        for s in ALL_INDIAN_STOCKS
        if s["ticker"] not in db_tickers and (
            q_lower in s["ticker"].lower() or q_lower in s["name"].lower()
        )
    ][:20]

    combined = db_stocks + extra
    return combined[:30]


@router.get("/market-movers", response_model=None)
async def get_market_movers(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get top market gainers and losers.
    Uses real yfinance data with simulation fallback.
    """
    return await stock_data_service.get_market_movers()


@router.get("/index-stocks", response_model=None)
async def get_index_stocks(
    index: str = Query("all", description="Filter by index: 'nifty', 'sensex', or 'all'"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Returns the master list of Nifty 100 + Sensex 30 stocks.
    This always returns 120 stocks regardless of what is seeded in the DB.
    Used by the frontend dropdown for instant offline display.
    """
    from app.core.indian_stocks import NIFTY_100, SENSEX_30
    if index == "nifty":
        return {"stocks": NIFTY_100, "count": len(NIFTY_100), "exchange": "NSE"}
    elif index == "sensex":
        return {"stocks": SENSEX_30, "count": len(SENSEX_30), "exchange": "BSE"}
    return {"stocks": ALL_INDIAN_STOCKS, "count": len(ALL_INDIAN_STOCKS), "exchange": "NSE+BSE"}


@router.get("/", response_model=List[schemas.StockSummary])
async def list_stocks(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    limit: int = Query(200, le=500),
    offset: int = Query(0, ge=0)
) -> Any:
    """
    List all active stocks in the database.
    """
    result = await db.execute(
        select(models.Stock).where(models.Stock.is_active == True).offset(offset).limit(limit)
    )
    return result.scalars().all()


# ─── Parametric routes AFTER specific routes ─────────────────────────────────

@router.get("/{ticker}", response_model=schemas.Stock)
async def get_stock_details(
    ticker: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get stock details by ticker. If not in DB, fetches from data provider and saves.
    """
    result = await db.execute(select(models.Stock).where(models.Stock.ticker == ticker.upper()))
    stock = result.scalars().first()

    if not stock:
        details = await stock_data_service.fetch_stock_details(ticker)
        if not details:
            raise HTTPException(status_code=404, detail="Stock not found")

        stock = models.Stock(
            ticker=details.get("Symbol"),
            name=details.get("Name"),
            sector=details.get("Sector"),
            industry=details.get("Industry"),
            description=details.get("Description"),
            is_active=True
        )
        db.add(stock)
        await db.commit()
        await db.refresh(stock)

    return stock


@router.get("/{ticker}/ohlcv")
async def get_stock_ohlcv(
    ticker: str,
    interval: str = Query("1d", description="Timeframe intervals: 1s,5s,10s,15s,30s,1m,3m,5m,10m,15m,30m,1h,2h,3h,4h,1d,5d,1wk,1mo,3mo,5mo,1y,5y"),
    limit: int = Query(200, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get OHLCV candlestick data for a stock.
    Bypasses DB for intraday intervals to get fresh data from yfinance.
    """
    stock_result = await db.execute(select(models.Stock).where(models.Stock.ticker == ticker.upper()))
    stock = stock_result.scalars().first()

    if not stock:
        # Auto-create if in master index
        idx = next((s for s in ALL_INDIAN_STOCKS if s["ticker"] == ticker.upper()), None)
        if idx:
            stock = models.Stock(
                ticker=idx["ticker"], name=idx["name"],
                sector=idx["sector"], industry=idx["industry"], is_active=True
            )
            db.add(stock)
            await db.commit()
            await db.refresh(stock)
        else:
            raise HTTPException(status_code=404, detail="Stock not found")

    # If asking for daily or weekly, try TimescaleDB first
    if interval in ("1d", "1wk"):
        query = text("""
            SELECT time, open, high, low, close, volume
            FROM ohlcv_data
            WHERE stock_id = :stock_id
            ORDER BY time DESC
            LIMIT :limit
        """)
        result = await db.execute(query, {"stock_id": stock.id, "limit": limit})
        rows = result.fetchall()

        if rows:
            candles = [{"time": row[0].isoformat(), "open": row[1], "high": row[2], "low": row[3], "close": row[4], "volume": row[5]} for row in rows]
            return {"ticker": ticker.upper(), "interval": interval, "data": list(reversed(candles))}

    # Fall back to yfinance for intraday / missing DB data
    data = await stock_data_service.fetch_historical_data(ticker, limit=limit, interval=interval)
    return {"ticker": ticker.upper(), "interval": interval, "data": data}


@router.get("/{ticker}/indicators")
async def get_stock_indicators(
    ticker: str,
    indicators: str = Query("sma20,sma50,rsi,macd", description="Comma-separated indicator list"),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Compute technical indicators server-side using pandas.
    Supported: sma{n}, ema{n}, rsi, macd, bb (Bollinger Bands).
    """
    candles_response = await get_stock_ohlcv(ticker, "1d", 300, db, current_user)
    candles = candles_response.get("data", [])

    if not candles:
        raise HTTPException(status_code=404, detail="No price data available")

    df = pd.DataFrame(candles)
    df["close"] = pd.to_numeric(df["close"])
    df["volume"] = pd.to_numeric(df["volume"])
    df = df.sort_values("time").reset_index(drop=True)

    results = {}
    indicator_list = [i.strip().lower() for i in indicators.split(",")]

    for indicator in indicator_list:
        if indicator.startswith("sma"):
            period = int(indicator[3:]) if len(indicator) > 3 else 20
            results[indicator] = df["close"].rolling(window=period).mean().round(2).tolist()
        elif indicator.startswith("ema"):
            period = int(indicator[3:]) if len(indicator) > 3 else 20
            results[indicator] = df["close"].ewm(span=period, adjust=False).mean().round(2).tolist()
        elif indicator == "rsi":
            delta = df["close"].diff()
            gain = delta.clip(lower=0).rolling(window=14).mean()
            loss = (-delta.clip(upper=0)).rolling(window=14).mean()
            rs = gain / loss
            results["rsi"] = (100 - (100 / (1 + rs))).round(2).tolist()
        elif indicator == "macd":
            ema12 = df["close"].ewm(span=12, adjust=False).mean()
            ema26 = df["close"].ewm(span=26, adjust=False).mean()
            macd_line = ema12 - ema26
            signal_line = macd_line.ewm(span=9, adjust=False).mean()
            results["macd"] = macd_line.round(4).tolist()
            results["macd_signal"] = signal_line.round(4).tolist()
            results["macd_hist"] = (macd_line - signal_line).round(4).tolist()
        elif indicator == "bb":
            sma20 = df["close"].rolling(20).mean()
            std20 = df["close"].rolling(20).std()
            results["bb_upper"] = (sma20 + 2 * std20).round(2).tolist()
            results["bb_middle"] = sma20.round(2).tolist()
            results["bb_lower"] = (sma20 - 2 * std20).round(2).tolist()

    return {
        "ticker": ticker.upper(),
        "timestamps": df["time"].tolist(),
        "indicators": results
    }


@router.get("/{ticker}/quote")
async def get_stock_quote(
    ticker: str,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get latest live quote for a stock (bid, ask, last price, change).
    Uses yfinance fast_info with simulation fallback.
    """
    return await stock_data_service.get_live_quote(ticker)


@router.get("/{ticker}/fundamentals")
async def get_stock_fundamentals(
    ticker: str,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get fundamental metrics (PE, PB, Market Cap, Valuation) for a stock.
    """
    return await stock_data_service.fetch_fundamentals(ticker)


@router.get("/index-performance")
async def get_index_performance(
    symbol: str = "^NSEI",
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get historical data for a market index (e.g. ^NSEI, ^BSESN).
    Used for dashboard sparklines.
    """
    return await stock_data_service.get_index_data(symbol)


@router.get("/{ticker}/news")
async def get_stock_news(
    ticker: str,
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get latest news for a specific stock.
    """
    return await stock_data_service.get_stock_news(ticker)



