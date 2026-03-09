"""
Alert Service: Manages price alerts, notifications, and alert trigger logic.
Async-first implementation using SQLAlchemy AsyncSession.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app import models, schemas
from app.models.alert import AlertStatus, AlertCondition
from datetime import datetime


class AlertService:
    async def create_alert(self, db: AsyncSession, alert_in: schemas.AlertCreate, user_id: int) -> models.Alert:
        """Create a new price alert for the user."""
        db_alert = models.Alert(
            user_id=user_id,
            ticker=alert_in.ticker,
            condition=alert_in.condition,
            target_price=alert_in.target_price,
            status=AlertStatus.ACTIVE
        )
        db.add(db_alert)
        await db.commit()
        await db.refresh(db_alert)
        return db_alert

    async def get_user_alerts(self, db: AsyncSession, user_id: int):
        """Get all alerts for a user."""
        result = await db.execute(
            select(models.Alert).where(models.Alert.user_id == user_id).order_by(models.Alert.created_at.desc())
        )
        return result.scalars().all()

    async def delete_alert(self, db: AsyncSession, alert_id: int, user_id: int) -> bool:
        """Delete an alert belonging to the user."""
        result = await db.execute(
            select(models.Alert).where(models.Alert.id == alert_id, models.Alert.user_id == user_id)
        )
        alert = result.scalars().first()
        if not alert:
            return False
        await db.delete(alert)
        await db.commit()
        return True

    async def get_user_notifications(self, db: AsyncSession, user_id: int):
        """Get all notifications for a user, newest first."""
        result = await db.execute(
            select(models.Notification).where(
                models.Notification.user_id == user_id
            ).order_by(models.Notification.created_at.desc()).limit(50)
        )
        return result.scalars().all()

    async def mark_notification_read(self, db: AsyncSession, notification_id: int, user_id: int) -> bool:
        """Mark a notification as read."""
        result = await db.execute(
            select(models.Notification).where(
                models.Notification.id == notification_id,
                models.Notification.user_id == user_id
            )
        )
        notification = result.scalars().first()
        if not notification:
            return False
        notification.is_read = True
        await db.commit()
        return True

    async def check_and_trigger_alerts(self, db: AsyncSession, ticker: str, current_price: float):
        """
        Check all active alerts for a ticker and trigger notifications if conditions are met.
        Called by background workers or price feed handlers.
        """
        result = await db.execute(
            select(models.Alert).where(
                models.Alert.ticker == ticker,
                models.Alert.status == AlertStatus.ACTIVE
            )
        )
        alerts = result.scalars().all()

        for alert in alerts:
            triggered = False
            if alert.condition == AlertCondition.ABOVE and current_price >= alert.target_price:
                triggered = True
            elif alert.condition == AlertCondition.BELOW and current_price <= alert.target_price:
                triggered = True

            if triggered:
                # Record alert trigger
                alert.status = AlertStatus.TRIGGERED
                alert.triggered_at = datetime.utcnow()

                # Create notification record
                notification = models.Notification(
                    user_id=alert.user_id,
                    title=f"🔔 Price Alert: {alert.ticker}",
                    message=f"{alert.ticker} has reached ${current_price:.2f} (your target: {alert.condition.value} ${alert.target_price:.2f})",
                    is_read=False
                )
                db.add(notification)

                # Log alert history
                history = models.AlertHistory(
                    alert_id=alert.id,
                    triggered_price=current_price,
                    triggered_at=datetime.utcnow()
                )
                db.add(history)

        await db.commit()

alert_service = AlertService()
