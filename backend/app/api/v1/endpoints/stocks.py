"""
Enhanced Stocks API: OHLCV data, indicators, search, and fundamental data.
Includes TimescaleDB time-bucket querying and server-side indicator calculation.
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

router = APIRouter()


@router.get("/search", response_model=List[schemas.Stock])
async def search_stocks(
    q: str = Query(..., min_length=1, description="Search query (ticker or company name)"),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Search for stocks by ticker or company name using full-text ILIKE matching.
    """
    stmt = select(models.Stock).where(
        (models.Stock.ticker.ilike(f"%{q}%")) | (models.Stock.name.ilike(f"%{q}%"))
    ).limit(20)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/", response_model=List[schemas.Stock])
async def list_stocks(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0)
) -> Any:
    """
    List all active stocks in the database.
    """
    result = await db.execute(
        select(models.Stock).where(models.Stock.is_active == True).offset(offset).limit(limit)
    )
    return result.scalars().all()


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
    interval: str = Query("1d", description="Timeframe: 1d, 1h, 15m"),
    limit: int = Query(200, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get OHLCV candlestick data for a stock, queried from TimescaleDB.
    Generates simulated data if historical data is not yet available in DB.
    """
    # Try to query from TimescaleDB ohlcv_data table
    stock_result = await db.execute(select(models.Stock).where(models.Stock.ticker == ticker.upper()))
    stock = stock_result.scalars().first()

    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    # Query from ohlcv_data table
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

    # Fall back to yfinance/simulated data if no historical data in DB
    mock_data = await stock_data_service.fetch_historical_data(ticker, limit=limit, interval=interval)
    return {"ticker": ticker.upper(), "interval": interval, "data": mock_data}


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
    # Get OHLCV data
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
    Get latest simulated quote for a stock (bid, ask, last price, change).
    """
    return await stock_data_service.get_live_quote(ticker)
