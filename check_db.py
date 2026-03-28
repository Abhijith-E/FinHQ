#!/usr/bin/env python3
"""
Diagnostic script to check database state and verify if trades are being saved.
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.core.config import settings
from app import models

async def check_database():
    engine = create_async_engine(str(settings.DATABASE_URL), echo=True)

    async with engine.begin() as conn:
        try:
            # Get table names
            result = await conn.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result]
            print("=" * 60)
            print("DATABASE TABLES:")
            print("=" * 60)
            for table in tables:
                print(f"  ✓ {table}")

            # Check if key tables exist
            required_tables = ['users', 'portfolios', 'positions', 'orders', 'transactions', 'stocks']
            missing = [t for t in required_tables if t not in tables]
            if missing:
                print(f"\n❌ MISSING TABLES: {missing}")
            else:
                print("\n✓ All required tables exist")

        except Exception as e:
            print(f"Error checking tables: {e}")

    # Now check actual data with a session
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as db:
        try:
            # Check users
            result = await db.execute(select(models.User).limit(5))
            users = result.scalars().all()
            print("\n" + "=" * 60)
            print("USERS:")
            print("=" * 60)
            for user in users:
                print(f"  ID: {user.id}, Email: {user.email}")

            # Check portfolios
            result = await db.execute(select(models.Portfolio).limit(5))
            portfolios = result.scalars().all()
            print("\n" + "=" * 60)
            print("PORTFOLIOS:")
            print("=" * 60)
            for p in portfolios:
                print(f"  ID: {p.id}, User ID: {p.user_id}, Cash: ${p.cash_balance:.2f}")

            # Check positions
            result = await db.execute(select(models.Position).limit(10))
            positions = result.scalars().all()
            print("\n" + "=" * 60)
            print("POSITIONS:")
            print("=" * 60)
            for pos in positions:
                print(f"  ID: {pos.id}, Portfolio ID: {pos.portfolio_id}, Stock ID: {pos.stock_id}, Qty: {pos.quantity}, Avg Price: ${pos.average_price:.2f}")

            # Check orders
            result = await db.execute(select(models.Order).order_by(models.Order.created_at.desc()).limit(10))
            orders = result.scalars().all()
            print("\n" + "=" * 60)
            print("RECENT ORDERS:")
            print("=" * 60)
            for order in orders:
                print(f"  ID: {order.id}, User ID: {order.user_id}, Ticker: {order.ticker}, Side: {order.side}, Qty: {order.quantity}, Status: {order.status}, Filled Avg: ${order.filled_avg_price or 0:.2f}")

            # Check transactions
            result = await db.execute(select(models.Transaction).limit(10))
            transactions = result.scalars().all()
            print("\n" + "=" * 60)
            print("TRANSACTIONS:")
            print("=" * 60)
            for t in transactions:
                print(f"  ID: {t.id}, Portfolio ID: {t.portfolio_id}, Stock ID: {t.stock_id}, Type: {t.type}, Qty: {t.quantity}, Price: ${t.price:.2f}")

        except Exception as e:
            print(f"Error querying data: {e}")
            import traceback
            traceback.print_exc()

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_database())
