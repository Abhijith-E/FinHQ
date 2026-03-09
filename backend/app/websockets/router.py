"""
WebSocket endpoints for real-time data streams.
Channels available:
  - price:{TICKER}     → Live price ticks using GBM simulation
  - portfolio:{USER_ID} → Portfolio value updates
  - alerts:{USER_ID}   → Triggered alert notifications
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.websockets.manager import manager
from app.core.config import settings
from jose import jwt, JWTError

router = APIRouter()


async def _authenticate_ws(token: str) -> int:
    """
    Authenticate a WebSocket connection using the JWT token.
    Returns user_id on success, raises ValueError on failure.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub", 0))
        return user_id
    except (JWTError, ValueError):
        return 0


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(default="")
):
    """
    Main WebSocket endpoint. Clients connect here then send subscribe/unsubscribe messages.

    Protocol:
      Connect: ws://host/ws?token=<jwt>
      Subscribe: {"action": "subscribe", "channel": "price:AAPL"}
      Unsubscribe: {"action": "unsubscribe", "channel": "price:AAPL"}
    """
    user_id = await _authenticate_ws(token) if token else 0
    await manager.connect(websocket)

    try:
        await websocket.send_json({
            "type": "connected",
            "user_id": user_id,
            "message": "WebSocket connected. Send {action: subscribe, channel: 'price:AAPL'} to start."
        })

        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            channel = data.get("channel", "")

            if action == "subscribe":
                # Authorize portfolio/alert channels by user_id
                if (channel.startswith("portfolio:") or channel.startswith("alerts:")):
                    channel_user = channel.split(":")[-1]
                    if str(user_id) != channel_user:
                        await websocket.send_json({"type": "error", "message": "Unauthorized channel"})
                        continue
                await manager.subscribe(websocket, channel)

            elif action == "unsubscribe":
                await manager.unsubscribe(websocket, channel)

            elif action == "ping":
                await websocket.send_json({"type": "pong"})

            else:
                await websocket.send_json({"type": "error", "message": f"Unknown action: {action}"})

    except WebSocketDisconnect:
        manager.disconnect(websocket)
