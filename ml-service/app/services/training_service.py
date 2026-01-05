import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from app.services.feature_service import feature_service
from app.core.mlflow_client import mlflow_client
import numpy as np

class TrainingService:
    def train_price_model(self, ticker: str, raw_data: list):
        """
        Skeleton for training a price prediction model.
        1. Feature Engineering
        2. Splitting
        3. Training
        4. MLflow Logging
        """
        # 1. Feature Engineering
        data = feature_service.calculate_technical_indicators(raw_data)
        df = pd.DataFrame(data)
        
        # Prepare Target (Close price next day)
        df['target'] = df['close'].shift(-1)
        df = df.dropna()
        
        features = ['momentum_rsi', 'trend_macd', 'volatility_bbm', 'trend_sma_20']
        X = df[features]
        y = df['target']
        
        # 2. Split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
        
        # 3. Train
        experiment_name = f"price_prediction_{ticker}"
        mlflow_client.start_experiment(experiment_name)
        
        model = RandomForestRegressor(n_estimators=100)
        model.fit(X_train, y_train)
        
        # 4. Eval & Log
        predictions = model.predict(X_test)
        mse = mean_squared_error(y_test, predictions)
        rmse = np.sqrt(mse)
        
        mlflow_client.log_params({"model_type": "RandomForest", "n_estimators": 100})
        mlflow_client.log_metrics({"rmse": rmse})
        
        return {"status": "success", "rmse": rmse}

training_service = TrainingService()
