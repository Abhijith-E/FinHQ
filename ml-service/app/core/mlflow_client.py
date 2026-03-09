import mlflow
import os

class MLflowClient:
    def __init__(self):
        # Point to the ml-flow container in Docker compose
        self.tracking_uri = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5000")
        mlflow.set_tracking_uri(self.tracking_uri)

    def start_experiment(self, experiment_name: str) -> str:
        """Set the active experiment and return its ID."""
        experiment = mlflow.get_experiment_by_name(experiment_name)
        if not experiment:
            experiment_id = mlflow.create_experiment(experiment_name)
        else:
            experiment_id = experiment.experiment_id
        
        mlflow.set_experiment(experiment_name)
        return experiment_id

    def active_run(self):
        """Context manager for an MLflow run."""
        return mlflow.start_run()

    def log_params(self, params: dict):
        mlflow.log_params(params)

    def log_metrics(self, metrics: dict):
        mlflow.log_metrics(metrics)

    def log_model(self, model, artifact_path: str):
        mlflow.sklearn.log_model(model, artifact_path)

    def end_run(self):
        mlflow.end_run()

mlflow_client = MLflowClient()
