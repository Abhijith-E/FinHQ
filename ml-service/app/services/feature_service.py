import pandas as pd
from ta.momentum import RSIIndicator
from ta.trend import MACD, SMAIndicator, EMAIndicator
from ta.volatility import BollingerBands
from ta.volume import OnBalanceVolumeIndicator
from typing import List, Dict, Any

class FeatureService:
    def calculate_technical_indicators(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Adds technical indicators to the raw OHLCV data.
        Expects list of dicts with keys: 'open', 'high', 'low', 'close', 'volume', 'time'
        """
        if not data:
            return []
            
        df = pd.DataFrame(data)
        
        # Ensure necessary columns are floats
        for col in ['open', 'high', 'low', 'close', 'volume']:
            df[col] = df[col].astype(float)
            
        # 1. Momentum: RSI (14)
        rsi = RSIIndicator(close=df['close'], window=14)
        df['momentum_rsi'] = rsi.rsi()
        
        # 2. Trend: MACD
        macd = MACD(close=df['close'])
        df['trend_macd'] = macd.macd()
        df['trend_macd_signal'] = macd.macd_signal()
        df['trend_macd_diff'] = macd.macd_diff()
        
        # 3. Volatility: Bollinger Bands
        bb = BollingerBands(close=df['close'], window=20, window_dev=2)
        df['volatility_bbm'] = bb.bollinger_mavg()
        df['volatility_bbh'] = bb.bollinger_hband()
        df['volatility_bbl'] = bb.bollinger_lband()
        
        # 4. Trend: SMA / EMA
        sma = SMAIndicator(close=df['close'], window=20)
        df['trend_sma_20'] = sma.sma_indicator()
        
        ema = EMAIndicator(close=df['close'], window=20)
        df['trend_ema_20'] = ema.ema_indicator()
        
        # 5. Volume: OBV
        obv = OnBalanceVolumeIndicator(close=df['close'], volume=df['volume'])
        df['volume_obv'] = obv.on_balance_volume()
        
        # Check for NaNs created by windows (e.g. first 14 rows for RSI)
        df = df.fillna(0)
        
        return df.to_dict(orient='records')

    def detect_candlestick_patterns(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detects simple candlestick patterns (Doji, Hammer).
        """
        df = pd.DataFrame(data)
        if df.empty:
            return []
            
        patterns = []
        for i, row in df.iterrows():
            open_price = row['open']
            close_price = row['close']
            high = row['high']
            low = row['low']
            
            body = abs(close_price - open_price)
            upper_shadow = high - max(close_price, open_price)
            lower_shadow = min(close_price, open_price) - low
            total_range = high - low
            
            # Doji: Body is very small relative to total range
            if total_range > 0 and body / total_range < 0.1:
                patterns.append({"index": i, "pattern": "Doji", "date": row.get('timestamp', i)})
                
            # Hammer: Small body, long lower shadow, small upper shadow
            if total_range > 0 and lower_shadow > 2 * body and upper_shadow < body:
                patterns.append({"index": i, "pattern": "Hammer", "date": row.get('timestamp', i)})
                
        return patterns

    def calculate_support_resistance(self, data: List[Dict[str, Any]]) -> Dict[str, List[float]]:
        """
        Identifies key support and resistance levels based on local minima/maxima.
        """
        df = pd.DataFrame(data)
        if df.empty:
            return {"support": [], "resistance": []}
            
        # Simple local extrema
        # In a real app, use more robust clustering (e.g. K-Means on pivot points)
        window = 5
        df['min'] = df['low'].rolling(window=window*2+1, center=True).min()
        df['max'] = df['high'].rolling(window=window*2+1, center=True).max()
        
        supports = df[df['low'] == df['min']]['low'].unique().tolist()
        resistances = df[df['high'] == df['max']]['high'].unique().tolist()
        
        # Filter close levels to reduce noise (naive approach)
        return {
            "support": sorted(supports)[:3], # Top 3 lowest supports
            "resistance": sorted(resistances, reverse=True)[:3] # Top 3 highest resistances
        }


feature_service = FeatureService()
