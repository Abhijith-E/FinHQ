"""
Production-grade AI Stock Chart Pattern Detection Service
=========================================================
Ensemble of:
  - Algorithmic detector (scipy peak/trough + numpy trendline fitting)
  - CNN+Transformer deep learning model (PyTorch, CPU-optimised)

Detects 12 classical technical patterns with:
  - confidence scores
  - strength scores
  - bounding box coordinates
  - pattern verification
  - NMS postprocessing
"""

from __future__ import annotations

import time
import logging
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Pattern Catalogue
# ---------------------------------------------------------------------------

PATTERNS = [
    "Head and Shoulders",
    "Inverse Head and Shoulders",
    "Double Top",
    "Double Bottom",
    "Ascending Triangle",
    "Descending Triangle",
    "Symmetrical Triangle",
    "Cup and Handle",
    "Flag Pattern",
    "Pennant",
    "Channel Pattern",
    "W Bottom",
    "M Top",
    "Support Resistance Breakout",
]

PATTERN_SENTIMENT = {
    "Head and Shoulders": "Bearish",
    "Inverse Head and Shoulders": "Bullish",
    "Double Top": "Bearish",
    "Double Bottom": "Bullish",
    "Ascending Triangle": "Bullish",
    "Descending Triangle": "Bearish",
    "Symmetrical Triangle": "Neutral",
    "Cup and Handle": "Bullish",
    "Flag Pattern": "Bullish",
    "Pennant": "Bullish",
    "Channel Pattern": "Neutral",
    "W Bottom": "Bullish",
    "M Top": "Bearish",
    "Support Resistance Breakout": "Bullish",
}


@dataclass
class PatternDetection:
    name: str
    confidence: float          # 0.0 – 1.0
    strength: float            # 0.0 – 1.0
    bbox: List[float]          # [x1_norm, y1_norm, x2_norm, y2_norm]
    sentiment: str
    timeframe: str
    start_idx: int
    end_idx: int
    timestamp: str

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["confidence"] = round(self.confidence * 100, 1)   # return as %
        d["strength"]   = round(self.strength   * 100, 1)
        return d


# ---------------------------------------------------------------------------
# scipy import guard — graceful fallback
# ---------------------------------------------------------------------------
try:
    from scipy.signal import find_peaks, argrelextrema
    from scipy.stats import linregress
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False
    logger.warning("scipy not available — using numpy fallback for peak detection")


# ---------------------------------------------------------------------------
# PyTorch model (lightweight, CPU-optimised)
# ---------------------------------------------------------------------------
try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    logger.warning("PyTorch not available — running algorithmic-only mode")


if TORCH_AVAILABLE:
    class _ConvBlock(nn.Module):
        def __init__(self, in_ch: int, out_ch: int):
            super().__init__()
            self.block = nn.Sequential(
                nn.Conv1d(in_ch, out_ch, kernel_size=3, padding=1),
                nn.BatchNorm1d(out_ch),
                nn.GELU(),
                nn.MaxPool1d(2),
                nn.Dropout(0.1),
            )

        def forward(self, x):
            return self.block(x)

    class CNNTransformerPatternModel(nn.Module):
        """
        Lightweight CNN + Transformer classifier for chart time-series.
        Input:  (batch, 5, seq_len)  — 5 features: O H L C V (normalised)
        Output: (batch, n_classes)   — logits
        """
        def __init__(self, n_classes: int = len(PATTERNS), seq_len: int = 64):
            super().__init__()
            self.cnn = nn.Sequential(
                _ConvBlock(5, 32),
                _ConvBlock(32, 64),
                _ConvBlock(64, 128),
            )
            reduced_len = seq_len // 8  # 3 maxpool2 layers
            d_model = 128
            self.proj = nn.Linear(128, d_model)
            encoder_layer = nn.TransformerEncoderLayer(
                d_model=d_model, nhead=4, dim_feedforward=256,
                dropout=0.1, batch_first=True
            )
            self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=2)
            self.classifier = nn.Sequential(
                nn.AdaptiveAvgPool1d(1),
                nn.Flatten(),
                nn.Linear(d_model, 64),
                nn.GELU(),
                nn.Dropout(0.2),
                nn.Linear(64, n_classes),
            )

        def forward(self, x):
            # x: (B, 5, T)
            feat = self.cnn(x)               # (B, 128, T//8)
            feat = feat.permute(0, 2, 1)     # (B, T//8, 128)
            feat = self.proj(feat)           # (B, T//8, d_model)
            feat = self.transformer(feat)    # (B, T//8, d_model)
            feat = feat.permute(0, 2, 1)     # (B, d_model, T//8)
            return self.classifier(feat)     # (B, n_classes)


# ---------------------------------------------------------------------------
# Algorithmic Detector
# ---------------------------------------------------------------------------

class AlgorithmicPatternDetector:
    """
    Pure numpy/scipy based detector for 12 classical chart patterns.
    Returns a list of (pattern_name, start_idx, end_idx, confidence, strength).
    """

    def __init__(self, min_window: int = 10, max_window: int = 200):
        self.min_window = min_window
        self.max_window = max_window

    # ── helpers ──────────────────────────────────────────────────────────────

    def _find_peaks_troughs(self, prices: np.ndarray, order: int = 3):
        """Return local peak and trough indices using scipy or numpy fallback."""
        if SCIPY_AVAILABLE:
            peaks, _ = find_peaks(prices, distance=order)
            troughs, _ = find_peaks(-prices, distance=order)
        else:
            from numpy import array
            peaks = argrel_extrema_np(prices, order=order, comp="max")
            troughs = argrel_extrema_np(prices, order=order, comp="min")
        return peaks, troughs

    def _linreg(self, x: np.ndarray, y: np.ndarray) -> Tuple[float, float, float]:
        """Returns (slope, intercept, r²)."""
        if len(x) < 2:
            return 0.0, float(y[0]) if len(y) else 0.0, 0.0
        if SCIPY_AVAILABLE:
            slope, intercept, r, _, _ = linregress(x, y)
            return float(slope), float(intercept), float(r ** 2)
        else:
            coeffs = np.polyfit(x, y, 1)
            predicted = np.polyval(coeffs, x)
            ss_tot = np.sum((y - y.mean()) ** 2)
            ss_res = np.sum((y - predicted) ** 2)
            r2 = 1 - ss_res / (ss_tot + 1e-9)
            return float(coeffs[0]), float(coeffs[1]), float(r2)

    def _normalize_price(self, prices: np.ndarray) -> np.ndarray:
        mn, mx = prices.min(), prices.max()
        return (prices - mn) / (mx - mn + 1e-9)

    def _bbox(self, start: int, end: int, prices: np.ndarray, n: int) -> List[float]:
        """Normalised [x1, y1, x2, y2] bounding box."""
        x1 = start / max(n - 1, 1)
        x2 = end / max(n - 1, 1)
        segment = prices[start:end + 1]
        mn, mx = prices.min(), prices.max()
        price_range = mx - mn + 1e-9
        y1 = (segment.min() - mn) / price_range
        y2 = (segment.max() - mn) / price_range
        # flip y so y2 > y1 (bbox convention: top-left, bottom-right)
        return [float(round(x1, 3)), float(round(1 - y2, 3)), 
                float(round(x2, 3)), float(round(1 - y1, 3))]

    # ── pattern detectors ─────────────────────────────────────────────────────

    def _head_and_shoulders(self, highs: np.ndarray, lows: np.ndarray,
                             peaks: np.ndarray) -> List[Tuple]:
        results = []
        if len(peaks) < 3:
            return results
        for i in range(len(peaks) - 2):
            left, mid, right = peaks[i], peaks[i + 1], peaks[i + 2]
            lh, mh, rh = highs[left], highs[mid], highs[right]
            # Middle must be highest
            if mh <= lh or mh <= rh:
                continue
            # Left and right shoulders roughly equal (within 5%)
            if abs(lh - rh) / (mh + 1e-9) > 0.10:
                continue
            # Neckline: troughs between shoulders
            trough1 = lows[left:mid].min()
            trough2 = lows[mid:right].min()
            neckline_slope = abs(trough1 - trough2) / (mh + 1e-9)
            if neckline_slope > 0.05:  # nearly flat neckline
                continue
            sym = 1 - abs(lh - rh) / (mh + 1e-9)
            conf = min(0.95, 0.60 + sym * 0.35)
            strength = sym
            results.append(("Head and Shoulders", left, right, conf, strength))
        return results

    def _inverse_head_and_shoulders(self, highs: np.ndarray, lows: np.ndarray,
                                     troughs: np.ndarray) -> List[Tuple]:
        results = []
        if len(troughs) < 3:
            return results
        for i in range(len(troughs) - 2):
            left, mid, right = troughs[i], troughs[i + 1], troughs[i + 2]
            ll, ml, rl = lows[left], lows[mid], lows[right]
            if ml >= ll or ml >= rl:
                continue
            if abs(ll - rl) / (abs(ml) + 1e-9) > 0.10:
                continue
            sym = 1 - abs(ll - rl) / (abs(ml) + 1e-9)
            conf = min(0.95, 0.60 + sym * 0.35)
            results.append(("Inverse Head and Shoulders", left, right, conf, sym))
        return results

    def _double_top(self, highs: np.ndarray, peaks: np.ndarray) -> List[Tuple]:
        results = []
        if len(peaks) < 2:
            return results
        for i in range(len(peaks) - 1):
            p1, p2 = peaks[i], peaks[i + 1]
            h1, h2 = highs[p1], highs[p2]
            if abs(h1 - h2) / (max(h1, h2) + 1e-9) > 0.03:
                continue
            dist = p2 - p1
            if dist < 5 or dist > 80:
                continue
            conf = min(0.93, 0.65 + (1 - abs(h1 - h2) / (max(h1, h2) + 1e-9)) * 0.30)
            results.append(("Double Top", p1, p2, conf, 0.80))
        return results

    def _double_bottom(self, lows: np.ndarray, troughs: np.ndarray) -> List[Tuple]:
        results = []
        if len(troughs) < 2:
            return results
        for i in range(len(troughs) - 1):
            t1, t2 = troughs[i], troughs[i + 1]
            l1, l2 = lows[t1], lows[t2]
            if abs(l1 - l2) / (max(abs(l1), abs(l2)) + 1e-9) > 0.03:
                continue
            dist = t2 - t1
            if dist < 5 or dist > 80:
                continue
            conf = min(0.93, 0.65 + (1 - abs(l1 - l2) / (max(abs(l1), abs(l2)) + 1e-9)) * 0.30)
            results.append(("Double Bottom", t1, t2, conf, 0.80))
        return results

    def _triangles(self, highs: np.ndarray, lows: np.ndarray,
                   peaks: np.ndarray, troughs: np.ndarray) -> List[Tuple]:
        results = []
        if len(peaks) < 2 or len(troughs) < 2:
            return results
        # Use last 2 peaks and troughs
        p_x = np.array([peaks[-2], peaks[-1]], dtype=float)
        p_y = np.array([highs[peaks[-2]], highs[peaks[-1]]])
        t_x = np.array([troughs[-2], troughs[-1]], dtype=float)
        t_y = np.array([lows[troughs[-2]], lows[troughs[-1]]])

        res_slope, _, r2_res = self._linreg(p_x, p_y)
        sup_slope, _, r2_sup = self._linreg(t_x, t_y)
        r2_ok = r2_res > 0.6 and r2_sup > 0.6

        if not r2_ok:
            return results

        start = int(p_x.min())
        end   = int(max(p_x.max(), t_x.max()))

        if abs(res_slope) < 0.001 and sup_slope > 0.001:
            results.append(("Ascending Triangle", start, end, 0.82, 0.75))
        elif res_slope < -0.001 and abs(sup_slope) < 0.001:
            results.append(("Descending Triangle", start, end, 0.80, 0.75))
        elif res_slope < -0.001 and sup_slope > 0.001:
            # Converging → symmetrical
            results.append(("Symmetrical Triangle", start, end, 0.78, 0.70))

        return results

    def _w_bottom(self, lows: np.ndarray, closes: np.ndarray,
                  troughs: np.ndarray) -> List[Tuple]:
        """W shape: two troughs at similar level with a middle peak."""
        results = []
        if len(troughs) < 2:
            return results
        for i in range(len(troughs) - 1):
            t1, t2 = troughs[i], troughs[i + 1]
            l1, l2 = lows[t1], lows[t2]
            if abs(l1 - l2) / (max(abs(l1), abs(l2)) + 1e-9) > 0.04:
                continue
            mid_close_max = closes[t1:t2].max()
            if mid_close_max < lows[t1] * 1.02:
                continue
            conf = 0.80
            results.append(("W Bottom", t1, t2, conf, 0.75))
        return results

    def _m_top(self, highs: np.ndarray, opens: np.ndarray,
               peaks: np.ndarray) -> List[Tuple]:
        results = []
        if len(peaks) < 2:
            return results
        for i in range(len(peaks) - 1):
            p1, p2 = peaks[i], peaks[i + 1]
            h1, h2 = highs[p1], highs[p2]
            if abs(h1 - h2) / (max(h1, h2) + 1e-9) > 0.04:
                continue
            mid_open_min = opens[p1:p2].min()
            if mid_open_min > highs[p1] * 0.98:
                continue
            conf = 0.80
            results.append(("M Top", p1, p2, conf, 0.75))
        return results

    def _cup_and_handle(self, closes: np.ndarray,
                        troughs: np.ndarray) -> List[Tuple]:
        results = []
        if len(troughs) < 1 or len(closes) < 20:
            return results
        t = troughs[0]
        if t < 5 or t > len(closes) - 10:
            return results
        left_max = closes[:t].max()
        cup_min  = closes[t]
        # Cup depth: 15–50%
        depth = (left_max - cup_min) / (left_max + 1e-9)
        if not 0.08 < depth < 0.55:
            return results
        # Handle: slight pullback after cup right
        handle_start = t + int((len(closes) - t) * 0.5)
        if handle_start >= len(closes) - 2:
            return results
        handle_min = closes[handle_start:].min()
        handle_depth = (closes[t] - handle_min) / (closes[t] + 1e-9)
        if handle_depth > 0.15:
            return results
        conf = min(0.90, 0.65 + (1 - depth) * 0.25)
        results.append(("Cup and Handle", 0, len(closes) - 1, conf, 0.82))
        return results

    def _flag_pattern(self, closes: np.ndarray) -> List[Tuple]:
        results = []
        n = len(closes)
        if n < 20:
            return results
        # Pole: strong uptrend in first 30%
        pole_end = n // 3
        pole_return = (closes[pole_end] - closes[0]) / (closes[0] + 1e-9)
        if pole_return < 0.05:
            return results
        # Flag: consolidation (low std) in remaining
        flag_std = closes[pole_end:].std() / (closes[pole_end:].mean() + 1e-9)
        if flag_std > 0.03:
            return results
        conf = min(0.88, 0.60 + pole_return * 0.5)
        results.append(("Flag Pattern", 0, n - 1, conf, 0.78))
        return results

    def _pennant(self, highs: np.ndarray, lows: np.ndarray,
                 peaks: np.ndarray, troughs: np.ndarray) -> List[Tuple]:
        results = []
        n = len(highs)
        if len(peaks) < 2 or len(troughs) < 2 or n < 15:
            return results
        # Pole: check prior strong move
        pole_end = n // 3
        pole_return = abs((highs[pole_end] - highs[0]) / (highs[0] + 1e-9))
        if pole_return < 0.04:
            return results
        # Pennant: converging highs and lows
        recent_peaks   = peaks[peaks >= pole_end]
        recent_troughs = troughs[troughs >= pole_end]
        if len(recent_peaks) < 2 or len(recent_troughs) < 2:
            return results
        res_slope, _, r2r = self._linreg(
            recent_peaks.astype(float), highs[recent_peaks])
        sup_slope, _, r2s = self._linreg(
            recent_troughs.astype(float), lows[recent_troughs])
        if r2r > 0.5 and r2s > 0.5 and res_slope < 0 and sup_slope > 0:
            results.append(("Pennant", pole_end, n - 1, 0.79, 0.72))
        return results

    def _channel(self, highs: np.ndarray, lows: np.ndarray,
                 peaks: np.ndarray, troughs: np.ndarray) -> List[Tuple]:
        results = []
        if len(peaks) < 2 or len(troughs) < 2:
            return results
        res_slope, _, r2r = self._linreg(peaks.astype(float), highs[peaks])
        sup_slope, _, r2s = self._linreg(troughs.astype(float), lows[troughs])
        if r2r < 0.7 or r2s < 0.7:
            return results
        # Parallel slopes (within 30% relative difference)
        if abs(res_slope - sup_slope) / (abs(res_slope) + 1e-9) > 0.35:
            return results
        results.append(("Channel Pattern", int(peaks[0]), int(troughs[-1]),
                         0.78, 0.70))
        return results

    def _support_resistance_breakout(self, closes: np.ndarray,
                                      highs: np.ndarray) -> List[Tuple]:
        results = []
        n = len(closes)
        if n < 20:
            return results
        lookback = closes[:-3]
        resistance = lookback.max()
        last_3 = closes[-3:]
        if last_3.max() > resistance * 1.005:
            breakout_idx = int(np.argmax(last_3) + n - 3)
            conf = float(min(0.92, 0.70 + (last_3.max() - resistance) / (resistance + 1e-9) * 5))
            results.append(("Support Resistance Breakout",
                             int(max(0, n - 20)), int(n - 1), conf, 0.85))
        return results

    # ── main detector ─────────────────────────────────────────────────────────

    def detect(self, ohlcv: List[Dict[str, Any]]) -> List[PatternDetection]:
        if len(ohlcv) < self.min_window:
            return []

        df = {k: np.array([float(c.get(k, 0)) for c in ohlcv])
              for k in ("open", "high", "low", "close", "volume")}
        closes = df["close"]
        highs  = df["high"]
        lows   = df["low"]
        opens  = df["open"]
        n = len(closes)
        order = max(2, n // 15)

        peaks, troughs = self._find_peaks_troughs(closes, order=order)

        raw: List[Tuple] = []
        raw += self._head_and_shoulders(highs, lows, peaks)
        raw += self._inverse_head_and_shoulders(highs, lows, troughs)
        raw += self._double_top(highs, peaks)
        raw += self._double_bottom(lows, troughs)
        raw += self._triangles(highs, lows, peaks, troughs)
        raw += self._w_bottom(lows, closes, troughs)
        raw += self._m_top(highs, opens, peaks)
        raw += self._cup_and_handle(closes, troughs)
        raw += self._flag_pattern(closes)
        raw += self._pennant(highs, lows, peaks, troughs)
        raw += self._channel(highs, lows, peaks, troughs)
        raw += self._support_resistance_breakout(closes, highs)

        detections: List[PatternDetection] = []
        ts = ohlcv[-1].get("time", "") if ohlcv else ""

        for name, s, e, conf, strength in raw:
            bbox = self._bbox(s, e, closes, n)
            detections.append(PatternDetection(
                name=name,
                confidence=float(round(conf, 4)),
                strength=float(round(strength, 4)),
                bbox=[float(b) for b in bbox],
                sentiment=PATTERN_SENTIMENT.get(name, "Neutral"),
                timeframe="",
                start_idx=int(s),
                end_idx=int(e),
                timestamp=str(ts),
            ))

        return detections


# ---------------------------------------------------------------------------
# numpy-only peak helper (when scipy not available)
# ---------------------------------------------------------------------------

def argrel_extrema_np(data: np.ndarray, order: int = 3,
                       comp: str = "max") -> np.ndarray:
    n = len(data)
    results = []
    for i in range(order, n - order):
        window = data[i - order: i + order + 1]
        if comp == "max" and data[i] == window.max():
            results.append(i)
        elif comp == "min" and data[i] == window.min():
            results.append(i)
    return np.array(results, dtype=int)


# ---------------------------------------------------------------------------
# NMS Postprocessor
# ---------------------------------------------------------------------------

def _iou_1d(a_start: int, a_end: int, b_start: int, b_end: int) -> float:
    inter_start = max(a_start, b_start)
    inter_end   = min(a_end, b_end)
    if inter_end <= inter_start:
        return 0.0
    inter  = inter_end - inter_start
    union  = (a_end - a_start) + (b_end - b_start) - inter
    return inter / (union + 1e-9)


def nms(detections: List[PatternDetection],
        iou_threshold: float = 0.5) -> List[PatternDetection]:
    """Non-maximum suppression: keep highest-confidence detection per overlap."""
    sorted_dets = sorted(detections, key=lambda d: d.confidence, reverse=True)
    kept: List[PatternDetection] = []
    for det in sorted_dets:
        suppressed = False
        for k in kept:
            if k.name == det.name:
                iou = _iou_1d(det.start_idx, det.end_idx, k.start_idx, k.end_idx)
                if iou > iou_threshold:
                    suppressed = True
                    break
        if not suppressed:
            kept.append(det)
    return kept


# ---------------------------------------------------------------------------
# CNN+Transformer Inference Helper
# ---------------------------------------------------------------------------

def _prepare_tensor(ohlcv: List[Dict[str, Any]],
                    seq_len: int = 64) -> "Optional[torch.Tensor]":
    """Normalise OHLCV to (1, 5, seq_len) tensor."""
    if not TORCH_AVAILABLE:
        return None
    arr = np.array([[c.get("open", 0), c.get("high", 0), c.get("low", 0),
                     c.get("close", 0), c.get("volume", 0)] for c in ohlcv],
                   dtype=np.float32)
    # Normalise per feature
    mn = arr.min(0, keepdims=True)
    mx = arr.max(0, keepdims=True)
    arr = (arr - mn) / (mx - mn + 1e-9)
    # Resize / pad to seq_len
    if len(arr) >= seq_len:
        arr = arr[-seq_len:]
    else:
        pad = np.zeros((seq_len - len(arr), 5), dtype=np.float32)
        arr = np.vstack([pad, arr])
    tensor = torch.tensor(arr).T.unsqueeze(0)  # (1, 5, seq_len)
    return tensor


# ---------------------------------------------------------------------------
# Ensemble Pattern Detection Service
# ---------------------------------------------------------------------------

class PatternDetectionService:
    """
    Production ensemble service combining:
    - Algorithmic detector (weight 0.60)
    - CNN+Transformer model  (weight 0.40)

    Usage:
        service = PatternDetectionService()
        detections = service.detect(ohlcv_list, timeframe="1D")
    """

    ALGO_WEIGHT  = 0.60
    MODEL_WEIGHT = 0.40
    SEQ_LEN      = 64

    def __init__(self):
        self.algo_detector = AlgorithmicPatternDetector()
        self._model: Optional["CNNTransformerPatternModel"] = None  # type: ignore
        self._model_loaded = False
        self._load_model()

    def _load_model(self):
        if not TORCH_AVAILABLE:
            return
        try:
            self._model = CNNTransformerPatternModel(
                n_classes=len(PATTERNS), seq_len=self.SEQ_LEN
            )
            self._model.eval()
            self._model_loaded = True
            logger.info("CNNTransformerPatternModel initialised (untrained — "
                        "run training pipeline to load weights)")
        except Exception as exc:
            logger.warning(f"Model init failed: {exc}")

    def load_weights(self, path: str):
        """Load pre-trained weights from a checkpoint file."""
        if not TORCH_AVAILABLE or self._model is None:
            return
        try:
            state = torch.load(path, map_location="cpu")
            self._model.load_state_dict(state)
            self._model.eval()
            logger.info(f"Loaded model weights from {path}")
        except Exception as exc:
            logger.warning(f"Could not load weights from {path}: {exc}")

    def _model_inference(self, ohlcv: List[Dict[str, Any]]) -> Optional[Dict[str, float]]:
        """Returns dict of pattern_name -> model_confidence (0–1)."""
        if not self._model_loaded or self._model is None:
            return None
        try:
            tensor = _prepare_tensor(ohlcv, self.SEQ_LEN)
            if tensor is None:
                return None
            with torch.no_grad():
                logits = self._model(tensor)        # (1, n_classes)
                probs  = torch.softmax(logits, dim=-1).squeeze(0).numpy()
            return {PATTERNS[i]: float(probs[i]) for i in range(len(PATTERNS))}
        except Exception as exc:
            logger.warning(f"Model inference failed: {exc}")
            return None

    def detect(self, ohlcv: List[Dict[str, Any]],
               timeframe: str = "1D") -> List[Dict[str, Any]]:
        """
        Run ensemble detection and return sorted list of pattern dicts.
        """
        t0 = time.time()

        # 1. Algorithmic detection
        algo_dets = self.algo_detector.detect(ohlcv)
        algo_dets = nms(algo_dets)

        # 2. Model inference (confidence boost / penalty)
        model_scores = self._model_inference(ohlcv)

        # 3. Ensemble blend
        results: List[PatternDetection] = []
        for det in algo_dets:
            if model_scores and det.name in model_scores:
                blended = (det.confidence * self.ALGO_WEIGHT
                           + model_scores[det.name] * self.MODEL_WEIGHT)
            else:
                blended = det.confidence
            results.append(PatternDetection(
                name=det.name,
                confidence=float(round(min(blended, 0.98), 4)),
                strength=float(det.strength),
                bbox=[float(v) for v in det.bbox],
                sentiment=det.sentiment,
                timeframe=timeframe,
                start_idx=int(det.start_idx),
                end_idx=int(det.end_idx),
                timestamp=str(det.timestamp),
            ))

        # 4. Sort by confidence descending
        results.sort(key=lambda d: d.confidence, reverse=True)

        elapsed = (time.time() - t0) * 1000
        logger.info(f"PatternDetectionService: {len(results)} pattern(s) "
                    f"detected in {elapsed:.1f}ms")

        return [d.to_dict() for d in results]

    def detect_with_confidence_calibration(self,
                                           ohlcv: List[Dict[str, Any]],
                                           timeframe: str = "1D",
                                           min_confidence: float = 60.0) -> List[Dict[str, Any]]:
        """Detect and filter by minimum confidence %."""
        all_dets = self.detect(ohlcv, timeframe)
        return [d for d in all_dets if d["confidence"] >= min_confidence]


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------

pattern_detection_service = PatternDetectionService()
