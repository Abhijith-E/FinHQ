import mlflow
import os

class MLflowClient:
    def __init__(self):
        # In a real setup, this would point to a remote server
        self.tracking_uri = os.getenv("MLFLOW_TRACKING_URI", "file:./mlruns")
        mlflow.set_tracking_uri(self.tracking_uri)
        
    def start_experiment(self, experiment_name: str):
        mlflow.set_experiment(experiment_name)
        
    def log_params(self, params: dict):
        mlflow.log_params(params)
        
    def log_metrics(self, metrics: dict):
        mlflow.log_metrics(metrics)

mlflow_client = MLflowClient()
