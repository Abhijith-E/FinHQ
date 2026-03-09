import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from app.services.feature_service import feature_service
from app.core.mlflow_client import mlflow_client
from typing import List, Dict, Any

class TrainingService:
    def train_price_model(self, ticker: str, raw_data: List[Dict[str, Any]]):
        """
        Trains a Random Forest price prediction model using an 80+ feature pipeline.
        Logs metrics, params, and the model to MLflow.
        """
        # 1. Feature Engineering pipeline
        df = feature_service.calculate_technical_indicators(raw_data)
        if df.empty or len(df) < 50:
            return {"status": "error", "message": "Not enough data to train after feature engineering"}

        # Prepare Target (predict next day's close)
        df['target'] = df['close'].shift(-1)
        df = df.dropna(subset=['target'])
        
        # Exclude non-numeric and leak columns from training
        exclude_cols = ['time', 'date', 'timestamp', 'target']
        feature_cols = [c for c in df.columns if c not in exclude_cols and pd.api.types.is_numeric_dtype(df[c])]
        
        X = df[feature_cols]
        y = df['target']
        
        # 2. Time-series Split (do not shuffle time series)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
        
        # 3. Model Configuration
        model_params = {
            "n_estimators": 100,
            "max_depth": 10,
            "random_state": 42
        }
        model = RandomForestRegressor(**model_params)
        
        # 4. MLflow Experiment Tracking
        experiment_name = f"Price_Prediction_{ticker.upper()}"
        experiment_id = mlflow_client.start_experiment(experiment_name)
        
        with mlflow_client.active_run() as run:
            # Train
            model.fit(X_train, y_train)
            
            # Predict and evaluate
            predictions = model.predict(X_test)
            mse = mean_squared_error(y_test, predictions)
            rmse = np.sqrt(mse)
            mae = mean_absolute_error(y_test, predictions)
            r2 = r2_score(y_test, predictions)
            
            # Log to MLflow
            mlflow_client.log_params({
                "ticker": ticker.upper(),
                "model_type": "RandomForestRegressor",
                "features_count": len(feature_cols),
                "train_samples": len(X_train),
                "test_samples": len(X_test),
                **model_params
            })
            
            mlflow_client.log_metrics({
                "mse": mse,
                "rmse": rmse,
                "mae": mae,
                "r2_score": r2
            })
            
            # Log the model artifacts
            mlflow_client.log_model(model, "random_forest_model")
            
            # Feature Importance
            importance = pd.DataFrame({
                "feature": feature_cols,
                "importance": model.feature_importances_
            }).sort_values('importance', ascending=False)
            top_features = importance.head(5).to_dict(orient='records')
            
        return {
            "status": "success", 
            "experiment_id": experiment_id,
            "run_id": run.info.run_id,
            "metrics": {
                "rmse": round(rmse, 4),
                "r2_score": round(r2, 4),
                "mae": round(mae, 4)
            },
            "top_features": top_features
        }

training_service = TrainingService()
