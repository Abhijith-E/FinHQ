from sqlalchemy.orm import Session
from fastapi import HTTPException
from app import models, schemas
from datetime import datetime

class BrokerService:
    def place_order(self, db: Session, order_in: schemas.OrderCreate, user_id: int):
        # 1. Fetch current price (Mocked for now, in real app fetch from StockDataService)
        # Assuming Market Order for simplicity
        current_price = 150.0 # Placeholder: In real app, get `stock_data_service.get_price(ticker)`
        
        # 2. Validate Funds (if Buying)
        # TODO: Check user.portfolio.cash >= quantity * price
        
        # 3. Create Order Record
        db_order = models.Order(
            user_id=user_id,
            ticker=order_in.ticker,
            type=order_in.type,
            side=order_in.side,
            quantity=order_in.quantity,
            price=order_in.price,
            status=models.order.OrderStatus.FILLED, # Instant fill for simulation
            filled_avg_price=current_price
        )
        db.add(db_order)
        
        # 4. Update Portfolio (Positions & Cash)
        # Note: This logic should ideally be transactional.
        # For this foundation, we just log the order. 
        # In a generic "Transaction" model we already have user holdings.
        # We should create a helper to update Portfolio/Transactions here.
        
        # Create a Transaction record
        transaction = models.Transaction(
            portfolio_id=1, # FIXME: Need to link to actual user portfolio
            ticker=order_in.ticker,
            type=models.portfolio.TransactionType.BUY if order_in.side == "BUY" else models.portfolio.TransactionType.SELL,
            quantity=order_in.quantity,
            price=current_price,
            date=datetime.now()
        )
        # db.add(transaction) # Uncomment when Portfolio linkage is robust
        
        db.commit()
        db.refresh(db_order)
        return db_order

    def get_user_orders(self, db: Session, user_id: int):
        return db.query(models.Order).filter(models.Order.user_id == user_id).order_by(models.Order.created_at.desc()).all()

broker_service = BrokerService()
