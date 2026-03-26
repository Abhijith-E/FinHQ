"""
WebSocket Connection Manager: Manages real-time connections for price feeds,
portfolio updates, and alert notifications.
Implements channels: price:{symbol}, portfolio:{user_id}, alerts:{user_id}
"""
import asyncio
import json
import random
import math
from typing import Dict, Set, Optional
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime


class ConnectionManager:
    """
    Manages WebSocket connections with a channel-based pub/sub model.
    Channels: price:{TICKER}, portfolio:{USER_ID}, alerts:{USER_ID}
    """

    def __init__(self):
        # channel_name -> set of websockets
        self.channels: Dict[str, Set[WebSocket]] = {}
        # websocket -> set of subscribed channels
        self.subscriptions: Dict[WebSocket, Set[str]] = {}

    async def connect(self, websocket: WebSocket) -> None:
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.subscriptions[websocket] = set()

    def disconnect(self, websocket: WebSocket) -> None:
        """Clean up all subscriptions for a disconnecting client."""
        if websocket in self.subscriptions:
            for channel in self.subscriptions[websocket]:
                if channel in self.channels:
                    self.channels[channel].discard(websocket)
                    if not self.channels[channel]:
                        del self.channels[channel]
            del self.subscriptions[websocket]

    async def subscribe(self, websocket: WebSocket, channel: str) -> None:
        """Subscribe a WebSocket to a specific channel."""
        if channel not in self.channels:
            self.channels[channel] = set()
        self.channels[channel].add(websocket)
        if websocket in self.subscriptions:
            self.subscriptions[websocket].add(channel)
        await websocket.send_json({"type": "subscribed", "channel": channel})

    async def unsubscribe(self, websocket: WebSocket, channel: str) -> None:
        """Unsubscribe a WebSocket from a channel."""
        if channel in self.channels:
            self.channels[channel].discard(websocket)
        if websocket in self.subscriptions:
            self.subscriptions[websocket].discard(channel)
        await websocket.send_json({"type": "unsubscribed", "channel": channel})

    async def broadcast_to_channel(self, channel: str, message: dict) -> None:
        """Broadcast a message to all subscribers of a channel."""
        if channel not in self.channels:
            return
        disconnected = set()
        for websocket in self.channels[channel]:
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.add(websocket)
        for ws in disconnected:
            self.disconnect(ws)

    async def send_personal_message(self, websocket: WebSocket, message: dict) -> None:
        """Send a message directly to a specific WebSocket."""
        await websocket.send_json(message)


# Singleton manager instance
manager = ConnectionManager()


# ─── GBM Price Simulation ────────────────────────────────────────────────────

_price_state: Dict[str, float] = {
    "RELIANCE.NS": 3000.0, "TCS.NS": 4000.0, "HDFCBANK.NS": 1600.0, "INFY.NS": 1650.0,
    "ICICIBANK.NS": 1050.0, "SBIN.NS": 750.0, "BHARTIARTL.NS": 1150.0, "ITC.NS": 450.0,
    "LT.NS": 3600.0, "HINDUNILVR.NS": 2400.0
}

def _next_tick(ticker: str) -> dict:
    """Generate next GBM tick for a ticker."""
    mu, sigma, dt = 0.0, 0.015, 1/252
    price = _price_state.get(ticker.upper(), 100.0)
    z = random.gauss(0, 1)
    new_price = price * math.exp((mu - 0.5 * sigma**2) * dt + sigma * math.sqrt(dt) * z)
    new_price = round(new_price, 2)
    _price_state[ticker.upper()] = new_price
    change = round(new_price - price, 2)
    change_pct = round((change / price) * 100, 3)

    return {
        "type": "price_tick",
        "ticker": ticker.upper(),
        "price": new_price,
        "change": change,
        "change_pct": change_pct,
        "volume": int(random.uniform(1000, 50000)),
        "timestamp": datetime.utcnow().isoformat()
    }


async def price_feed_task() -> None:
    """
    Background task that continuously generates price ticks via GBM
    and broadcasts them to subscribers on price:{TICKER} channels.
    Runs every 2 seconds.
    """
    while True:
        for ticker in list(_price_state.keys()):
            channel = f"price:{ticker}"
            if channel in manager.channels and manager.channels[channel]:
                tick = _next_tick(ticker)
                await manager.broadcast_to_channel(channel, tick)
        await asyncio.sleep(2)
