from typing import List, Dict, Any
import pandas as pd
from app.services.feature_service import feature_service

class BacktestService:
    def run_backtest(
        self, 
        ticker: str, 
        rules: List[Dict[str, Any]], 
        data: List[Dict[str, Any]], 
        initial_capital: float = 10000.0
    ) -> Dict[str, Any]:
        """
        Runs a simulation of the strategy rules against historical data.
        """
        if not data or not rules:
            return {"error": "Insufficient data or rules"}
            
        # 1. Prepare Data with Features
        # The FeatureService adds RSI, MACD, etc.
        enriched_data = feature_service.calculate_technical_indicators(data)
        df = pd.DataFrame(enriched_data)
        
        # 2. Simulation Loop
        cash = initial_capital
        position = 0 # Shares held
        equity_curve = []
        trades = []
        
        for i, row in df.iterrows():
            current_price = row['close']
            date = row.get('time', row.get('date'))
            
            # Evaluate Rules
            signal = "HOLD"
            for rule in rules:
                indicator = rule.get('indicator') # e.g. "RSI"
                operator = rule.get('operator')   # e.g. "<"
                value = float(rule.get('value', 0))      # e.g. 30
                action = rule.get('action')       # e.g. "BUY"
                
                # Context mapping
                current_val = 0
                if indicator == "RSI":
                    current_val = row.get('momentum_rsi', 50)
                elif indicator == "Price":
                    current_val = current_price
                # Add more mappings as needed (MACD, SMA, etc.)
                
                # Check Condition
                condition_met = False
                if operator == "<":
                    condition_met = current_val < value
                elif operator == ">":
                    condition_met = current_val > value
                elif operator == "=":
                    condition_met = current_val == value
                    
                if condition_met:
                    signal = action
                    break # Priority to first matching rule for simplicity
            
            # Execute Trade
            if signal == "BUY" and cash > current_price:
                # Buy Max
                shares_to_buy = int(cash // current_price)
                if shares_to_buy > 0:
                    cost = shares_to_buy * current_price
                    cash -= cost
                    position += shares_to_buy
                    trades.append({
                        "date": date,
                        "action": "BUY",
                        "price": current_price,
                        "shares": shares_to_buy
                    })
            elif signal == "SELL" and position > 0:
                # Sell All
                revenue = position * current_price
                cash += revenue
                
                # approximate profit calc for this trade could be done here
                trades.append({
                    "date": date,
                    "action": "SELL",
                    "price": current_price,
                    "shares": position
                })
                position = 0
                
            # Track Equity
            total_value = cash + (position * current_price)
            equity_curve.append({
                "time": date,
                "value": round(total_value, 2)
            })
            
        # 3. Calculate Metrics
        final_value = equity_curve[-1]['value'] if equity_curve else initial_capital
        total_return_pct = ((final_value - initial_capital) / initial_capital) * 100
        
        # Win Rate (Simplified: simplistic trade pairing required for accurate win rate)
        # For now, just return raw trades count
        
        return {
            "initial_capital": initial_capital,
            "final_value": final_value,
            "total_return_pct": round(total_return_pct, 2),
            "trades_count": len(trades),
            "trades": trades,
            "equity_curve": equity_curve
        }

backtest_service = BacktestService()
