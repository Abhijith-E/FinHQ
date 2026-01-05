import numpy as np
import pandas as pd
from typing import List, Dict, Any

class RiskService:
    def calculate_portfolio_risk(self, holdings: List[Dict[str, Any]], history_data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
        """
        Calculates portfolio risk metrics.
        
        Args:
            holdings: List of dicts with 'ticker' and 'weight' (or 'value').
            history_data: Dict mapping ticker to list of OHLCV data.
            
        Returns:
            Dict containing VaR, Volatility, Sharpe, etc.
        """
        if not holdings or not history_data:
            return {"error": "Insufficient data"}
            
        # 1. Align Data & Calculate Returns
        # We need a DataFrame of close prices for all assets aligned by date
        df_prices = pd.DataFrame()
        
        for ticker, data in history_data.items():
            if not data:
                continue
            df_asset = pd.DataFrame(data)
            df_asset['date'] = pd.to_datetime(df_asset['time'] if 'time' in df_asset.columns else df_asset.get('date'))
            df_asset.set_index('date', inplace=True)
            df_prices[ticker] = df_asset['close'].astype(float)
            
        # Drop rows with any NaNs to ensure alignment
        df_prices.dropna(inplace=True)
        
        if df_prices.empty:
            return {"error": "No aligned historical data found"}
            
        # Calculate Daily Returns
        returns = df_prices.pct_change().dropna()
        
        # 2. Calculate Portfolio Returns
        # Normalize weights
        total_value = sum(h.get('value', 0) for h in holdings)
        weights = []
        if total_value > 0:
            weights = [h.get('value', 0) / total_value for h in holdings if h['ticker'] in returns.columns]
        else:
            # Fallback to equal weights if values missing
            n = len(returns.columns)
            weights = [1/n] * n
            
        weights = np.array(weights)
        
        # Portfolio series of returns
        port_returns = returns.dot(weights)
        
        # 3. Calculate Metrics
        
        # Value at Risk (VaR) - Historical Simulation (95% Confidence)
        # The 5th percentile of daily returns
        var_95_pct = np.percentile(port_returns, 5)
        
        # Annualized Volatility
        daily_volatility = port_returns.std()
        annual_volatility = daily_volatility * np.sqrt(252)
        
        # Sharpe Ratio (assuming risk-free rate ~0 for simplicity or 2%)
        rf_rate = 0.02
        mean_return_annual = port_returns.mean() * 252
        sharpe_ratio = (mean_return_annual - rf_rate) / annual_volatility if annual_volatility != 0 else 0
        
        return {
            "metrics": {
                "var_95_daily_pct": round(var_95_pct * 100, 2), # e.g. -2.5%
                "annual_volatility_pct": round(annual_volatility * 100, 2),
                "sharpe_ratio": round(sharpe_ratio, 2),
                "max_drawdown_pct": round(self._calculate_max_drawdown(port_returns) * 100, 2)
            },
            "interpretation": {
                "var_95": f"With 95% confidence, you will not lose more than {abs(round(var_95_pct * 100, 2))}% in a single day.",
                "volatility": "High" if annual_volatility > 0.25 else "Medium" if annual_volatility > 0.15 else "Low"
            }
        }
        
    def _calculate_max_drawdown(self, returns):
        # Reconstruct equity curve
        wealth_index = (1 + returns).cumprod()
        previous_peaks = wealth_index.cummax()
        drawdowns = (wealth_index - previous_peaks) / previous_peaks
        return drawdowns.min()

risk_service = RiskService()
