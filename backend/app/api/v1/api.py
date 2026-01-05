from fastapi import APIRouter
from app.api.v1.endpoints import auth, stocks, strategies, trading, alerts, social, education

api_router = APIRouter()
api_router.include_router(auth.router, tags=["login"])
api_router.include_router(stocks.router, prefix="/stocks", tags=["stocks"])
api_router.include_router(strategies.router, prefix="/strategies", tags=["strategies"])
api_router.include_router(trading.router, prefix="/trading", tags=["trading"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(social.router, prefix="/social", tags=["social"])
api_router.include_router(education.router, prefix="/education", tags=["education"])

