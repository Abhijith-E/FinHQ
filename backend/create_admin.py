import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), "."))

from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core import security
from sqlalchemy import select

async def update_or_create_exact_admin():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == "admin@example.com"))
        existing_user = result.scalars().first()
        hashed_pwd = security.get_password_hash("admin123")
        
        if existing_user:
            existing_user.hashed_password = hashed_pwd
            existing_user.is_superuser = True
            existing_user.is_verified = True
            await db.commit()
            print("✅ Successfully updated existing user admin@example.com with password 'admin123' and superuser rights.")
        else:
            new_user = User(
                email="admin@example.com",
                hashed_password=hashed_pwd,
                full_name="Admin User",
                is_active=True,
                is_superuser=True,
                is_verified=True
            )
            db.add(new_user)
            await db.commit()
            print("✅ Successfully created user admin@example.com with password 'admin123'.")

if __name__ == "__main__":
    asyncio.run(update_or_create_exact_admin())
