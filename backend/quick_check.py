import asyncio
import sys
import os

# Ensure we can import from backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db.session import engine

async def main():
    try:
        async with engine.connect() as conn:
            # Try to get table names
            result = await conn.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result]
            print("Database tables found:")
            for t in tables:
                print(f"  - {t}")

            # Check for key tables
            required = ['users', 'portfolios', 'positions', 'orders', 'transactions', 'stocks']
            missing = [t for t in required if t not in tables]
            if missing:
                print(f"\nMissing tables: {missing}")
            else:
                print("\nAll required tables exist!")
    except Exception as e:
        print(f"Error connecting to database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
