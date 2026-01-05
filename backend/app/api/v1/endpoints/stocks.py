from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app import schemas, models
from app.api import deps
from app.db.session import get_db
from app.services.stock_data_service import stock_data_service

router = APIRouter()

@router.get("/search", response_model=List[schemas.Stock])
async def search_stocks(
    q: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Search for stocks by ticker or name.
    """
    stmt = select(models.Stock).where(
        (models.Stock.ticker.ilike(f"%{q}%")) | (models.Stock.name.ilike(f"%{q}%"))
    )
    result = await db.execute(stmt)
    stocks = result.scalars().all()
    return stocks

@router.get("/{ticker}", response_model=schemas.Stock)
async def get_stock_details(
    ticker: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get stock details. If not in DB, fetch from external API and save.
    """
    stmt = select(models.Stock).where(models.Stock.ticker == ticker.upper())
    result = await db.execute(stmt)
    stock = result.scalars().first()
    
    if not stock:
        # Fetch from service
        details = await stock_data_service.fetch_stock_details(ticker)
        if not details:
            raise HTTPException(status_code=404, detail="Stock not found")
            
        stock = models.Stock(
            ticker=details.get("Symbol"),
            name=details.get("Name"),
            sector=details.get("Sector"),
            industry=details.get("Industry"),
            is_active=True
        )
        db.add(stock)
        await db.commit()
        await db.refresh(stock)
        
    return stock

@router.get("/{ticker}/history", response_model=List[schemas.Price])
async def get_stock_history(
    ticker: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get historical prices for a stock.
    """
    stmt = select(models.Stock).where(models.Stock.ticker == ticker.upper())
    result = await db.execute(stmt)
    stock = result.scalars().first()
    
    if not stock:
         raise HTTPException(status_code=404, detail="Stock not found")
         
    # Check if we have recent prices (simplified logic)
    # In real app, query ID and time range
    
    # For now, just generic mock fetch if empty to populate
    # Note: TimescaleDB would be queried here typically
    
    # Mock return from service for this phase
    mock_data = await stock_data_service.fetch_historical_data(ticker)
    
    # Convert to schema format
    prices = []
    for d in mock_data:
        prices.append(schemas.Price(
            stock_id=stock.id,
            open=d["open"],
            high=d["high"],
            low=d["low"],
            close=d["close"],
            volume=d["volume"],
            time=d["time"]
        ))
        
    return prices
