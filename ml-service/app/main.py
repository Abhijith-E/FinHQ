from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import features, training, sentiment, prediction, recommendation, technical, risk, fundamental, backtest









app = FastAPI(
    title="AI-Powered Investment Platform - ML Service",
    docs_url="/docs",
    debug=True
)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(features.router, prefix="/api/v1/features", tags=["features"])
app.include_router(training.router, prefix="/api/v1/training", tags=["training"])
app.include_router(sentiment.router, prefix="/api/v1/sentiment", tags=["sentiment"])
app.include_router(prediction.router, prefix="/api/v1/prediction", tags=["prediction"])
app.include_router(recommendation.router, prefix="/api/v1/recommendation", tags=["recommendation"])
app.include_router(technical.router, prefix="/api/v1/technical", tags=["technical"])
app.include_router(risk.router, prefix="/api/v1/risk", tags=["risk"])
app.include_router(fundamental.router, prefix="/api/v1/fundamental", tags=["fundamental"])
app.include_router(backtest.router, prefix="/api/v1/backtest", tags=["backtest"])









@app.get("/")
def root():

    return {"message": "ML Service Operational", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
