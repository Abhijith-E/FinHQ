from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime

class AlertService:
    def create_alert(self, db: Session, alert_in: schemas.AlertCreate, user_id: int) -> models.Alert:
        db_alert = models.Alert(
            user_id=user_id,
            ticker=alert_in.ticker,
            condition=alert_in.condition,
            target_price=alert_in.target_price,
            status=models.alert.AlertStatus.ACTIVE
        )
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        return db_alert

    def get_user_alerts(self, db: Session, user_id: int):
        return db.query(models.Alert).filter(models.Alert.user_id == user_id).all()

    def get_user_notifications(self, db: Session, user_id: int):
        return db.query(models.Notification).filter(models.Notification.user_id == user_id).order_by(models.Notification.created_at.desc()).all()

    def check_alerts(self, db: Session, ticker: str, current_price: float):
        """
        Check all active alerts for a ticker and trigger notifications if met.
        This would be called by the StockDataService or a background worker.
        """
        alerts = db.query(models.Alert).filter(
            models.Alert.ticker == ticker, 
            models.Alert.status == models.alert.AlertStatus.ACTIVE
        ).all()
        
        for alert in alerts:
            triggered = False
            if alert.condition == models.alert.AlertCondition.ABOVE and current_price >= alert.target_price:
                triggered = True
            elif alert.condition == models.alert.AlertCondition.BELOW and current_price <= alert.target_price:
                triggered = True
            
            if triggered:
                # 1. Update Alert Status
                alert.status = models.alert.AlertStatus.TRIGGERED
                alert.triggered_at = datetime.now()
                
                # 2. Create Notification
                notification = models.Notification(
                    user_id=alert.user_id,
                    title=f"Alert Triggered: {alert.ticker}",
                    message=f"{alert.ticker} has reached ${current_price} ({alert.condition} ${alert.target_price})"
                )
                db.add(notification)
        
        db.commit()

alert_service = AlertService()
