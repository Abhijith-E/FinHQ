import pandas as pd
from ta import add_all_ta_features
from ta.utils import dropna
from typing import List, Dict, Any

class FeatureService:
    def calculate_technical_indicators(self, data: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Extensively adds 80+ technical indicators to the raw OHLCV data using the 'ta' package.
        Expects list of dicts with keys: 'open', 'high', 'low', 'close', 'volume', 'time'
        """
        if not data:
            return pd.DataFrame()

        df = pd.DataFrame(data)

        # Map to expected lowercase columns for safety
        for col in ['open', 'high', 'low', 'close', 'volume']:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')

        # Drop initial NaNs before processing
        df = dropna(df)

        # Use the 'ta' library's helper to add all ~86 technical features at once
        # These include volume, volatility, trend, momentum, and others.
        try:
            df = add_all_ta_features(
                df, open="open", high="high", low="low", close="close", volume="volume", fillna=True
            )
        except Exception as e:
            print(f"Error calculating TA features: {e}")

        # Add custom price-based features (returns, log-returns)
        import numpy as np
        df['return_1d'] = df['close'].pct_change(1).fillna(0)
        df['log_return_1d'] = np.log(df['close'] / df['close'].shift(1)).fillna(0)
        df['return_5d'] = df['close'].pct_change(5).fillna(0)
        df['volatility_20d'] = df['return_1d'].rolling(window=20).std().fillna(0)

        # Time-based features
        if 'time' in df.columns:
            df['time'] = pd.to_datetime(df['time'])
            df['day_of_week'] = df['time'].dt.dayofweek
            df['month'] = df['time'].dt.month

        # Forward fill and fillna with 0 for remaining NaNs
        df = df.ffill().fillna(0)
        
        return df

    def detect_candlestick_patterns(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detects simple candlestick patterns (Doji, Hammer).
        """
        df = pd.DataFrame(data)
        if df.empty:
            return []

        patterns = []
        for i, row in df.iterrows():
            open_price, close_price = row.get('open', 0), row.get('close', 0)
            high, low = row.get('high', 0), row.get('low', 0)

            body = abs(close_price - open_price)
            upper_shadow = high - max(close_price, open_price)
            lower_shadow = min(close_price, open_price) - low
            total_range = high - low

            # Doji: Body is very small relative to total range
            if total_range > 0 and body / total_range < 0.1:
                patterns.append({"index": i, "pattern": "Doji", "date": row.get('time', i)})

            # Hammer: Small body, long lower shadow, small upper shadow
            if total_range > 0 and lower_shadow > 2 * body and upper_shadow < body:
                patterns.append({"index": i, "pattern": "Hammer", "date": row.get('time', i)})

        return patterns

    def calculate_support_resistance(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Identify support and resistance levels from OHLCV data using
        local extrema and price clustering.
        """
        import numpy as np
        if not data:
            return {"support": [], "resistance": []}

        df = pd.DataFrame(data)
        for col in ['high', 'low', 'close']:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')

        highs = df['high'].dropna().values if 'high' in df.columns else np.array([])
        lows  = df['low'].dropna().values  if 'low'  in df.columns else np.array([])

        if len(highs) == 0 or len(lows) == 0:
            return {"support": [], "resistance": []}

        # Simple percentile-based levels
        resistance_levels = [
            float(np.percentile(highs, 95)),
            float(np.percentile(highs, 85)),
            float(np.percentile(highs, 75)),
        ]
        support_levels = [
            float(np.percentile(lows, 5)),
            float(np.percentile(lows, 15)),
            float(np.percentile(lows, 25)),
        ]
        return {
            "support":    [round(v, 2) for v in sorted(support_levels)],
            "resistance": [round(v, 2) for v in sorted(resistance_levels, reverse=True)],
        }

feature_service = FeatureService()
