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
from app.models.stock import Stock
from app.services.stock_data_service import stock_data_service
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
            print(f"[DEBUG] No portfolio found for user {user_id}, creating new one")
            portfolio = models.Portfolio(
                user_id=user_id,
                name="Default Portfolio",
                cash_balance=100000.0  # Start with $100k paper money
            )
            db.add(portfolio)
            await db.flush()
            print(f"[DEBUG] Created new portfolio with ID: {portfolio.id}")
        else:
            print(f"[DEBUG] Found existing portfolio with ID: {portfolio.id}")
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
        Market orders are filled at real market price fetched via yfinance.
        Limit orders are filled if price is favorable.
        """
        print(f"[DEBUG] Placing order: user={user_id}, ticker={order_in.ticker}, side={order_in.side}, qty={order_in.quantity}, type={order_in.type}")

        portfolio = await self._get_or_create_portfolio(db, user_id)
        print(f"[DEBUG] Using portfolio ID: {portfolio.id}, cash_balance: {portfolio.cash_balance}")

        # Ensure stock exists in database
        stmt = select(Stock).where(Stock.ticker == order_in.ticker.upper())
        result = await db.execute(stmt)
        stock = result.scalars().first()
        if not stock:
            # Fetch stock details from yfinance and create locally
            print(f"[DEBUG] Stock {order_in.ticker} not found, creating new stock record")
            details = await stock_data_service.fetch_stock_details(order_in.ticker)
            stock = Stock(
                ticker=details.get("Symbol", order_in.ticker.upper()),
                name=details.get("Name", order_in.ticker),
                sector=details.get("Sector", "N/A"),
                industry=details.get("Industry", "N/A"),
                description=details.get("Description", ""),
                is_active=True
            )
            db.add(stock)
            await db.flush()
            print(f"[DEBUG] Created stock ID: {stock.id}")
        else:
            print(f"[DEBUG] Found existing stock ID: {stock.id}")

        # Get real current price using yfinance (with fallback to simulation)
        try:
            quote = await stock_data_service.get_live_quote(order_in.ticker)
            current_price = quote.get("last") or quote.get("price") or quote.get("bid") or quote.get("ask")
            if not current_price:
                raise ValueError("No price in quote")
        except Exception as e:
            # Fallback to simulated price if yfinance fails
            print(f"[DEBUG] Live quote failed for {order_in.ticker}: {e}, using simulated price")
            current_price = await self._get_simulated_price(order_in.ticker)

        print(f"[DEBUG] Current price for {order_in.ticker}: {current_price}")

        # Determine fill price and status
        if order_in.type == OrderType.MARKET:
            fill_price = current_price
            status = OrderStatus.FILLED
        elif order_in.type == OrderType.LIMIT:
            limit_price = order_in.price
            if limit_price is None:
                fill_price = current_price
                status = OrderStatus.FILLED
            else:
                # For BUY: fill if limit >= current (willing to pay at least market)
                # For SELL: fill if limit <= current (willing to accept at least market)
                if order_in.side == OrderSide.BUY and limit_price >= current_price:
                    fill_price = current_price
                    status = OrderStatus.FILLED
                elif order_in.side == OrderSide.SELL and limit_price <= current_price:
                    fill_price = current_price
                    status = OrderStatus.FILLED
                else:
                    status = OrderStatus.PENDING
                    fill_price = None
        else:
            fill_price = current_price
            status = OrderStatus.FILLED

        print(f"[DEBUG] Order status: {status}, fill_price: {fill_price}")

        # Validate buying power for BUY orders that will fill
        if order_in.side == OrderSide.BUY and status == OrderStatus.FILLED and fill_price:
            cost = fill_price * order_in.quantity
            if portfolio.cash_balance < cost:
                raise HTTPException(status_code=400, detail=f"Insufficient funds. Required: ₹{cost:.2f}, Available: ₹{portfolio.cash_balance:.2f}")

        # Create Order record
        db_order = models.Order(
            user_id=user_id,
            ticker=order_in.ticker.upper(),
            type=order_in.type,
            side=order_in.side,
            quantity=order_in.quantity,
            price=order_in.price,
            status=status,
            filled_avg_price=fill_price
        )
        db.add(db_order)
        await db.flush()  # Get db_order.id before passing to _update_positions
        print(f"[DEBUG] Added order to session, order ID: {db_order.id}")

        # If filled, update portfolio positions and cash
        if status == OrderStatus.FILLED and fill_price:
            print("[DEBUG] Order filled, updating positions")
            await self._update_positions(db, portfolio, order_in, fill_price, stock.id, order_id=db_order.id)
            print("[DEBUG] Positions updated")
        else:
            print("[DEBUG] Order not filled, skipping position update")

        await db.commit()
        await db.refresh(db_order)
        print(f"[DEBUG] Order committed, order ID: {db_order.id}")
        return db_order

    async def _update_positions(self, db: AsyncSession, portfolio: models.Portfolio, order_in: schemas.OrderCreate, fill_price: float, stock_id: int, order_id: int = None):
        """Update portfolio positions and cash balance after a fill."""
        from app.models.portfolio import TransactionType

        # Find existing position
        result = await db.execute(
            select(models.Position).where(
                models.Position.portfolio_id == portfolio.id,
                models.Position.stock_id == stock_id
            )
        )
        position = result.scalars().first()

        print(f"[DEBUG] _update_positions: side={order_in.side}, qty={order_in.quantity}, fill_price={fill_price}, portfolio_id={portfolio.id}, stock_id={stock_id}")

        if order_in.side == OrderSide.BUY:
            cost = float(fill_price) * float(order_in.quantity)
            portfolio.cash_balance = float(portfolio.cash_balance) - cost
            print(f"[DEBUG] Deducted cost {cost} from cash_balance, new balance: {portfolio.cash_balance}")

            if position:
                # Average down/up cost basis with precise float arithmetic
                old_qty = float(position.quantity)
                new_qty = float(order_in.quantity)
                total_qty = old_qty + new_qty
                position.average_price = round(((old_qty * float(position.average_price)) + (new_qty * float(fill_price))) / total_qty, 4)
                position.quantity = total_qty
                print(f"[DEBUG] Updated existing position: qty={position.quantity}, avg_price={position.average_price}")
            else:
                position = models.Position(
                    portfolio_id=portfolio.id,
                    stock_id=stock_id,
                    quantity=float(order_in.quantity),
                    average_price=float(fill_price)
                )
                db.add(position)
                await db.flush()  # flush so position gets its ID
                print(f"[DEBUG] Created new position: qty={order_in.quantity}, avg_price={fill_price}, id={position.id}")

        elif order_in.side == OrderSide.SELL:
            if not position or float(position.quantity) < float(order_in.quantity):
                raise HTTPException(status_code=400, detail="Insufficient shares to sell")
            proceeds = float(fill_price) * float(order_in.quantity)
            portfolio.cash_balance = float(portfolio.cash_balance) + proceeds
            position.quantity = float(position.quantity) - float(order_in.quantity)
            print(f"[DEBUG] Sold {order_in.quantity} shares, new qty: {position.quantity}, cash_balance: {portfolio.cash_balance}")
            if position.quantity <= 0:
                await db.delete(position)
                print("[DEBUG] Position quantity reached 0, deleted position")
                position = None

        # Log a Transaction record (portfolio ledger)
        transaction = models.Transaction(
            portfolio_id=portfolio.id,
            stock_id=stock_id,
            type=TransactionType.BUY.value if order_in.side == OrderSide.BUY else TransactionType.SELL.value,
            quantity=float(order_in.quantity),
            price=float(fill_price),
            timestamp=datetime.utcnow()
        )
        db.add(transaction)
        print("[DEBUG] Added transaction to session")

        # Also create a Trade record linked to the order (for execution history)
        if order_id is not None:
            trade = models.Trade(
                order_id=order_id,
                execution_price=float(fill_price),
                quantity=int(order_in.quantity),
            )
            db.add(trade)
            print(f"[DEBUG] Added Trade record for order_id={order_id}")

        # Flush to ensure all writes are staged and errors surface early
        try:
            await db.flush()
            print("[DEBUG] Flush successful")
        except Exception as e:
            print(f"[DEBUG] Flush failed: {e}")
            raise

    async def get_user_orders(self, db: AsyncSession, user_id: int):
        """Retrieve all orders for a user."""
        print(f"[DEBUG] get_user_orders called for user_id={user_id}")
        result = await db.execute(
            select(models.Order).where(models.Order.user_id == user_id).order_by(models.Order.created_at.desc())
        )
        orders = result.scalars().all()
        print(f"[DEBUG] Found {len(orders)} orders for user {user_id}")
        return orders

    async def get_user_positions(self, db: AsyncSession, user_id: int):
        """Get current positions with live prices from yfinance."""
        print(f"[DEBUG] get_user_positions called for user_id={user_id}")

        from sqlalchemy.orm import selectinload
        portfolio = await self._get_or_create_portfolio(db, user_id)
        print(f"[DEBUG] Portfolio ID: {portfolio.id}, cash_balance: {portfolio.cash_balance}")

        result = await db.execute(
            select(models.Position)
            .where(models.Position.portfolio_id == portfolio.id)
            .options(selectinload(models.Position.stock))
        )
        positions = result.scalars().all()
        print(f"[DEBUG] Found {len(positions)} positions for portfolio {portfolio.id}")

        enriched = []
        for pos in positions:
            ticker = pos.stock.ticker if pos.stock else "UNKNOWN"
            print(f"[DEBUG] Processing position: id={pos.id}, ticker={ticker}, qty={pos.quantity}, avg={pos.average_price}")
            # Fetch real-time price with fallback to simulated
            try:
                quote = await stock_data_service.get_live_quote(ticker)
                live_price = quote.get("last") or quote.get("price") or quote.get("bid") or quote.get("ask")
                if not live_price:
                    raise ValueError("No price")
            except Exception:
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

        print(f"[DEBUG] Returning {len(enriched)} enriched positions")
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
