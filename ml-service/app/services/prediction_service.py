import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
from app.models.lstm import PriceLSTM
from sklearn.preprocessing import MinMaxScaler
import os

class PredictionService:
    def __init__(self):
        self.model_path = "models/lstm_model.pth"
        os.makedirs("models", exist_ok=True)
        # Hyperparameters
        self.input_dim = 1 # Using 'Close' price only for now
        self.hidden_dim = 32
        self.num_layers = 2
        self.output_dim = 1
        self.seq_length = 60 # Lookback period
        self.scaler = MinMaxScaler(feature_range=(-1, 1))

    def create_sequences(self, data: np.ndarray, seq_length: int) -> Tuple[np.ndarray, np.ndarray]:
        xs = []
        ys = []
        for i in range(len(data) - seq_length - 1):
            x = data[i:(i + seq_length)]
            y = data[i + seq_length]
            xs.append(x)
            ys.append(y)
        return np.array(xs), np.array(ys)

    def train_lstm_model(self, ticker: str, raw_data: List[Dict[str, Any]]):
        """
        Trains an LSTM model on the provided OHLCV data.
        """
        # 1. Prepare Data
        df = pd.DataFrame(raw_data)
        if df.empty:
            return {"status": "error", "message": "No data provided"}

        prices = df[['close']].values.astype(float)
        
        # Train on normalized data
        data_normalized = self.scaler.fit_transform(prices)
        
        X_train, y_train = self.create_sequences(data_normalized, self.seq_length)
        
        # Convert to Tensors
        X_train = torch.from_numpy(X_train).float()
        y_train = torch.from_numpy(y_train).float()
        
        # 2. Initialize Model
        model = PriceLSTM(
            input_dim=self.input_dim, 
            hidden_dim=self.hidden_dim, 
            num_layers=self.num_layers, 
            output_dim=self.output_dim
        )
        
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
        
        # 3. Train Loop
        num_epochs = 50 # Keep it small for demo
        model.train()
        for epoch in range(num_epochs):
            outputs = model(X_train)
            optimizer.zero_grad()
            
            loss = criterion(outputs, y_train)
            loss.backward()
            optimizer.step()
            
            if epoch % 10 == 0:
                print(f"Epoch {epoch}, Loss: {loss.item()}")
                
        # 4. Save
        torch.save(model.state_dict(), self.model_path)
        
        return {"status": "success", "final_loss": loss.item()}

    def predict_next_price(self, raw_data: List[Dict[str, Any]]) -> float:
        """
        Predicts the next day's price based on the latest sequence.
        """
        # Load Model
        model = PriceLSTM(
            input_dim=self.input_dim, 
            hidden_dim=self.hidden_dim, 
            num_layers=self.num_layers, 
            output_dim=self.output_dim
        )
        try:
            model.load_state_dict(torch.load(self.model_path))
        except FileNotFoundError:
            return 0.0 # Return 0 if model hasn't been trained
            
        model.eval()
        
        # Prepare Input
        df = pd.DataFrame(raw_data)
        prices = df[['close']].values.astype(float)
        
        # Fit scaler on history to respect scale (in real app, load saved scaler)
        self.scaler.fit(prices)
        data_normalized = self.scaler.transform(prices)
        
        # Get last sequence
        if len(data_normalized) < self.seq_length:
             return 0.0 # Not enough data
             
        last_seq = data_normalized[-self.seq_length:]
        last_seq = torch.from_numpy(last_seq).float().unsqueeze(0) # Add batch dim
        
        # Predict
        with torch.no_grad():
            prediction = model(last_seq)
            
        # Inverse transform
        prediction_price = self.scaler.inverse_transform(prediction.numpy())[0][0]
        
        return float(prediction_price)

prediction_service = PredictionService()
