import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.db.session import AsyncSessionLocal
from app.models.stock import Stock
from app.core.indian_stocks import ALL_INDIAN_STOCKS

async def seed_data():
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        print(f"🚀 Seeding {len(ALL_INDIAN_STOCKS)} Indian stocks (Nifty 100 + Sensex)...")
        added = 0
        updated = 0
        skipped = 0
        
        for stock_data in ALL_INDIAN_STOCKS:
            result = await db.execute(select(Stock).where(Stock.ticker == stock_data["ticker"]))
            stock = result.scalars().first()

            if not stock:
                new_stock = Stock(
                    ticker=stock_data["ticker"],
                    name=stock_data["name"],
                    sector=stock_data["sector"],
                    industry=stock_data["industry"],
                    is_active=True,
                )
                db.add(new_stock)
                added += 1
            else:
                # Update existing if needed (ensure name/sector match)
                if stock.name != stock_data["name"] or stock.sector != stock_data.get("sector"):
                    stock.name = stock_data["name"]
                    stock.sector = stock_data.get("sector", "N/A")
                    stock.industry = stock_data.get("industry", "N/A")
                    updated += 1
                else:
                    skipped += 1

        await db.commit()
        print(f"✅ Seeding Complete!")
        print(f"   - {added} stocks created")
        print(f"   - {updated} stocks updated")
        print(f"   - {skipped} stocks already up-to-date")


if __name__ == "__main__":
    asyncio.run(seed_data())
