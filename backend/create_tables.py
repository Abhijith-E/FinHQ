#!/usr/bin/env python3
"""
Script to create all database tables if they don't exist.
Run this once to initialize the database schema.
"""
import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine
from app.models import Base

async def create_tables():
    print("Creating all database tables...")
    async with engine.begin() as conn:
        # This will create all tables defined in Base's metadata
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Tables created successfully (if they didn't exist already).")

if __name__ == "__main__":
    asyncio.run(create_tables())
