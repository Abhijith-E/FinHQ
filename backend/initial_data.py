import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.db.session import AsyncSessionLocal
from app.models.stock import Stock

INITIAL_STOCKS = [
    {"ticker": "AAPL", "name": "Apple Inc.", "sector": "Technology", "industry": "Consumer Electronics"},
    {"ticker": "MSFT", "name": "Microsoft Corporation", "sector": "Technology", "industry": "Software - Infrastructure"},
    {"ticker": "GOOGL", "name": "Alphabet Inc.", "sector": "Technology", "industry": "Internet Content & Information"},
    {"ticker": "AMZN", "name": "Amazon.com Inc.", "sector": "Consumer Cyclical", "industry": "Internet Retail"},
    {"ticker": "TSLA", "name": "Tesla Inc.", "sector": "Consumer Cyclical", "industry": "Auto Manufacturers"},
    {"ticker": "NVDA", "name": "NVIDIA Corporation", "sector": "Technology", "industry": "Semiconductors"},
    {"ticker": "META", "name": "Meta Platforms Inc.", "sector": "Technology", "industry": "Internet Content & Information"},
    {"ticker": "BRK.B", "name": "Berkshire Hathaway Inc.", "sector": "Financial Services", "industry": "Insurance - Diversified"},
    {"ticker": "JPM", "name": "JPMorgan Chase & Co.", "sector": "Financial Services", "industry": "Banks - Diversified"},
    {"ticker": "V", "name": "Visa Inc.", "sector": "Financial Services", "industry": "Credit Services"},
]

async def seed_data():
    async with AsyncSessionLocal() as db:
        print("Seeding stocks...")
        for stock_data in INITIAL_STOCKS:
            # Check if exists
            from sqlalchemy import select
            result = await db.execute(select(Stock).where(Stock.ticker == stock_data["ticker"]))
            stock = result.scalars().first()
            
            if not stock:
                new_stock = Stock(**stock_data)
                db.add(new_stock)
                print(f"Added {stock_data['ticker']}")
            else:
                print(f"Skipping {stock_data['ticker']} (already exists)")
        
        await db.commit()

if __name__ == "__main__":
    asyncio.run(seed_data())
