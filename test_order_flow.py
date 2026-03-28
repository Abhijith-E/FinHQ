#!/usr/bin/env python3
"""
Test script to simulate the order flow and check if data is being saved.
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.db.session import AsyncSessionLocal
from app.services.broker_service import broker_service
from app import schemas
from app.models.user import User
from sqlalchemy import select

async def test_order_flow():
    """Test placing an order and checking if data appears in queries."""

    # Create async session
    async with AsyncSessionLocal() as db:
        try:
            # Get or create a test user
            result = await db.execute(select(User).where(User.email == "test@example.com"))
            user = result.scalars().first()

            if not user:
                print("Creating test user...")
                from app.models.user import User as UserModel
                from app.core.security import get_password_hash
                user = UserModel(
                    email="test@example.com",
                    hashed_password=get_password_hash("testpassword"),
                    full_name="Test User",
                    is_active=True
                )
                db.add(user)
                await db.commit()
                await db.refresh(user)
                print(f"✓ Created user with ID: {user.id}")
            else:
                print(f"✓ Found user with ID: {user.id}")

            user_id = user.id

            print("\n" + "="*60)
            print("TESTING ORDER PLACEMENT")
            print("="*60)

            # Test BUY order
            print("\n1. Placing BUY order for RELIANCE.NS...")
            order_in = schemas.OrderCreate(
                ticker="RELIANCE.NS",
                type="MARKET",
                side="BUY",
                quantity=10,
                price=None
            )

            try:
                order = await broker_service.place_order(db=db, order_in=order_in, user_id=user_id)
                await db.commit()
                print(f"   ✓ Order placed! ID: {order.id}, Status: {order.status}, Filled Avg: {order.filled_avg_price}")
            except Exception as e:
                print(f"   ❌ Failed to place order: {e}")
                import traceback
                traceback.print_exc()
                await db.rollback()

            # Test SELL order (need to have shares first)
            print("\n2. Placing SELL order for 5 shares...")
            order_in2 = schemas.OrderCreate(
                ticker="RELIANCE.NS",
                type="MARKET",
                side="SELL",
                quantity=5,
                price=None
            )

            try:
                order2 = await broker_service.place_order(db=db, order_in=order_in2, user_id=user_id)
                await db.commit()
                print(f"   ✓ Order placed! ID: {order2.id}, Status: {order2.status}, Filled Avg: {order2.filled_avg_price}")
            except Exception as e:
                print(f"   ❌ Failed to place sell order: {e}")
                import traceback
                traceback.print_exc()
                await db.rollback()

            print("\n" + "="*60)
            print("CHECKING DATABASE STATE")
            print("="*60)

            # Check orders
            result = await db.execute(select(models.Order).where(models.Order.user_id == user_id).order_by(models.Order.created_at.desc()))
            orders = result.scalars().all()
            print(f"\n3. User's orders: {len(orders)} found")
            for o in orders:
                print(f"   - Order ID {o.id}: {o.side} {o.quantity} {o.ticker} @ {o.filled_avg_price} ({o.status})")

            # Get portfolio
            portfolio = await broker_service._get_or_create_portfolio(db, user_id)
            print(f"\n4. Portfolio ID: {portfolio.id}, Cash Balance: {portfolio.cash_balance}")

            # Check positions
            result = await db.execute(
                select(models.Position).where(models.Position.portfolio_id == portfolio.id).options(
                    # Use selectinload to load stock relationship
                )
            )
            positions = result.scalars().all()
            print(f"\n5. Positions from direct query: {len(positions)} found")
            for pos in positions:
                print(f"   - Position: Stock ID {pos.stock_id}, Qty: {pos.quantity}, Avg Price: {pos.average_price}")

            # Check positions via broker service
            positions_data = await broker_service.get_user_positions(db, user_id)
            print(f"\n6. Positions from service: {len(positions_data['positions'])} found")
            for pos in positions_data['positions']:
                print(f"   - {pos['ticker']}: {pos['quantity']} @ {pos['average_price']}")

            # Check transactions
            result = await db.execute(select(models.Transaction).where(models.Transaction.portfolio_id == portfolio.id))
            transactions = result.scalars().all()
            print(f"\n7. Transactions: {len(transactions)} found")
            for t in transactions:
                print(f"   - Transaction: {t.type} {t.quantity} {t.stock_id} @ {t.price}")

            print("\n" + "="*60)
            print("TEST COMPLETE")
            print("="*60)

        except Exception as e:
            print(f"Error during test: {e}")
            import traceback
            traceback.print_exc()
            await db.rollback()
        finally:
            await db.close()

if __name__ == "__main__":
    # Import models at top level to avoid circular imports
    from app import models
    asyncio.run(test_order_flow())
