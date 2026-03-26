"""
Broker Service: Handles paper trading order placement, fills, and position management.
Uses async SQLAlchemy for all DB operations.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from fastapi import HTTPException
from app import models, schemas
from app.models.order import OrderStatus, OrderType, OrderSide
from app.models.portfolio import TransactionType
from datetime import datetime
import random


class BrokerService:
    async def _get_or_create_portfolio(self, db: AsyncSession, user_id: int) -> models.Portfolio:
        """Get user's default portfolio or create one if it doesn't exist."""
        result = await db.execute(
            select(models.Portfolio).where(models.Portfolio.user_id == user_id)
        )
        portfolio = result.scalars().first()
        if not portfolio:
            portfolio = models.Portfolio(
                user_id=user_id,
                name="Default Portfolio",
                cash_balance=100000.0  # Start with $100k paper money
            )
            db.add(portfolio)
            await db.flush()
        return portfolio

    async def _get_simulated_price(self, ticker: str) -> float:
        """Simulate a current market price using GBM-like random walk."""
        # In production, this would fetch from a real-time data provider
        base_prices = {
            "RELIANCE.NS": 3000.0, "TCS.NS": 4000.0, "HDFCBANK.NS": 1600.0, "INFY.NS": 1650.0,
            "ICICIBANK.NS": 1050.0, "SBIN.NS": 750.0, "BHARTIARTL.NS": 1150.0, "ITC.NS": 450.0,
            "LT.NS": 3600.0, "HINDUNILVR.NS": 2400.0
        }
        base = base_prices.get(ticker.upper(), 100.0)
        # Add small random noise to simulate market fluctuation
        return round(base * (1 + random.uniform(-0.005, 0.005)), 2)

    async def place_order(self, db: AsyncSession, order_in: schemas.OrderCreate, user_id: int) -> models.Order:
        """
        Place a market or limit order in paper trading simulation.
        Market orders are instantly filled; limit orders are queued.
        """
        portfolio = await self._get_or_create_portfolio(db, user_id)
        current_price = await self._get_simulated_price(order_in.ticker)

        # Determine fill price
        if order_in.type == "MARKET":
            fill_price = current_price
            status = OrderStatus.FILLED
        elif order_in.type == "LIMIT":
            fill_price = order_in.price or current_price
            # Fill immediately if limit price is favorable
            if order_in.side == "BUY" and fill_price >= current_price:
                status = OrderStatus.FILLED
            elif order_in.side == "SELL" and fill_price <= current_price:
                status = OrderStatus.FILLED
            else:
                status = OrderStatus.PENDING
                fill_price = None
        else:
            fill_price = current_price
            status = OrderStatus.FILLED

        # Validate buying power for BUY orders
        if order_in.side == "BUY" and status == OrderStatus.FILLED:
            cost = (fill_price or 0) * order_in.quantity
            if portfolio.cash_balance < cost:
                raise HTTPException(status_code=400, detail=f"Insufficient funds. Required: ${cost:.2f}, Available: ${portfolio.cash_balance:.2f}")

        # Create Order record
        db_order = models.Order(
            user_id=user_id,
            ticker=order_in.ticker,
            type=order_in.type,
            side=order_in.side,
            quantity=order_in.quantity,
            price=order_in.price,
            status=status,
            filled_avg_price=fill_price
        )
        db.add(db_order)

        # If filled, update portfolio positions and cash
        if status == OrderStatus.FILLED and fill_price:
            await self._update_positions(db, portfolio, order_in, fill_price)

        await db.commit()
        await db.refresh(db_order)
        return db_order

    async def _update_positions(self, db: AsyncSession, portfolio: models.Portfolio, order_in: schemas.OrderCreate, fill_price: float):
        """Update portfolio positions and cash balance after a fill."""
        from app.models.stock import Stock
        from app.models.portfolio import TransactionType
        
        # Look up stock_id
        st_result = await db.execute(select(Stock).where(Stock.ticker == order_in.ticker))
        stock = st_result.scalars().first()
        if not stock:
            raise HTTPException(status_code=404, detail=f"Stock {order_in.ticker} not found in database for portfolio reference")
        
        # Find existing position
        result = await db.execute(
            select(models.Position).where(
                models.Position.portfolio_id == portfolio.id,
                models.Position.stock_id == stock.id
            )
        )
        position = result.scalars().first()

        if order_in.side == "BUY":
            cost = fill_price * order_in.quantity
            portfolio.cash_balance -= cost

            if position:
                # Average down/up cost basis
                total_qty = position.quantity + order_in.quantity
                position.average_price = ((position.quantity * position.average_price) + (order_in.quantity * fill_price)) / total_qty
                position.quantity = total_qty
            else:
                position = models.Position(
                    portfolio_id=portfolio.id,
                    stock_id=stock.id,
                    quantity=order_in.quantity,
                    average_price=fill_price
                )
                db.add(position)

        elif order_in.side == "SELL":
            if not position or position.quantity < order_in.quantity:
                raise HTTPException(status_code=400, detail="Insufficient shares to sell")
            proceeds = fill_price * order_in.quantity
            portfolio.cash_balance += proceeds
            position.quantity -= order_in.quantity
            if position.quantity == 0:
                await db.delete(position)

        # Log a transaction
        transaction = models.Transaction(
            portfolio_id=portfolio.id,
            stock_id=stock.id,
            type=TransactionType.BUY.value if order_in.side == "BUY" else TransactionType.SELL.value,
            quantity=order_in.quantity,
            price=fill_price,
            timestamp=datetime.utcnow()
        )
        db.add(transaction)

    async def get_user_orders(self, db: AsyncSession, user_id: int):
        """Retrieve all orders for a user."""
        result = await db.execute(
            select(models.Order).where(models.Order.user_id == user_id).order_by(models.Order.created_at.desc())
        )
        return result.scalars().all()

    async def get_user_positions(self, db: AsyncSession, user_id: int):
        """Get current positions with live prices."""
        from sqlalchemy.orm import selectinload
        portfolio = await self._get_or_create_portfolio(db, user_id)
        result = await db.execute(
            select(models.Position)
            .where(models.Position.portfolio_id == portfolio.id)
            .options(selectinload(models.Position.stock))
        )
        positions = result.scalars().all()

        enriched = []
        for pos in positions:
            ticker = pos.stock.ticker if pos.stock else "UNKNOWN"
            live_price = await self._get_simulated_price(ticker)
            unrealized_pnl = (live_price - pos.average_price) * pos.quantity
            enriched.append({
                "ticker": ticker,
                "quantity": pos.quantity,
                "average_price": pos.average_price,
                "current_price": live_price,
                "market_value": live_price * pos.quantity,
                "unrealized_pnl": round(unrealized_pnl, 2),
                "unrealized_pnl_pct": round((unrealized_pnl / (pos.average_price * pos.quantity)) * 100, 2) if pos.average_price > 0 else 0
            })

        return {
            "cash_balance": portfolio.cash_balance,
            "positions": enriched,
            "total_value": portfolio.cash_balance + sum(p["market_value"] for p in enriched)
        }

    async def cancel_order(self, db: AsyncSession, order_id: int, user_id: int) -> models.Order:
        """Cancel a pending order."""
        result = await db.execute(
            select(models.Order).where(models.Order.id == order_id, models.Order.user_id == user_id)
        )
        order = result.scalars().first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.status != OrderStatus.PENDING:
            raise HTTPException(status_code=400, detail="Only pending orders can be cancelled")
        order.status = OrderStatus.CANCELLED
        await db.commit()
        await db.refresh(order)
        return order

broker_service = BrokerService()
