"""
Chart Renderer + OpenCV Annotation Engine
==========================================
Generates high-resolution candlestick charts from OHLCV data and
annotates detected patterns with bounding boxes.
"""

from __future__ import annotations

import io
import base64
import logging
from typing import List, Dict, Any, Optional

import numpy as np

logger = logging.getLogger(__name__)

# Graceful imports
try:
    import mplfinance as mpf
    import matplotlib
    matplotlib.use("Agg")          # non-interactive backend
    import matplotlib.pyplot as plt
    import matplotlib.patches as patches
    MPL_AVAILABLE = True
except ImportError:
    MPL_AVAILABLE = False
    logger.warning("mplfinance / matplotlib not available — chart rendering disabled")

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    logger.warning("OpenCV not available — annotation will use matplotlib")

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


# ── Colour palette per sentiment ───────────────────────────────────────────

SENTIMENT_COLOURS = {
    "Bullish":  (16,  185, 129),   # emerald-500
    "Bearish":  (239,  68,  68),   # red-500
    "Neutral":  (99,  102, 241),   # indigo-500
    "Reversal": (245, 158,  11),   # amber-500
}

# ── Chart size ───────────────────────────────────────────────────────────────

CHART_WIDTH_PX  = 1200
CHART_HEIGHT_PX = 700
DPI = 100


class ChartRenderer:
    """Renders OHLCV data to a PNG and overlays pattern bounding boxes."""

    def _ohlcv_to_dataframe(self, ohlcv: List[Dict[str, Any]]) -> "Optional[pd.DataFrame]":
        if not PANDAS_AVAILABLE:
            return None
        df = pd.DataFrame(ohlcv)
        required = {"open", "high", "low", "close"}
        if not required.issubset(df.columns):
            return None
        for col in ["open", "high", "low", "close", "volume"]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
        if "time" in df.columns:
            df["time"] = pd.to_datetime(df["time"])
            df = df.set_index("time")
        else:
            df.index = pd.date_range("2020-01-01", periods=len(df), freq="D")
        df = df[["open", "high", "low", "close", "volume"]].dropna(
            subset=["open", "high", "low", "close"]
        )
        df.columns = ["Open", "High", "Low", "Close", "Volume"]
        return df

    def render_chart_png(self, ohlcv: List[Dict[str, Any]],
                          show_volume: bool = True,
                          show_ma: bool = True) -> Optional[bytes]:
        """Render raw candlestick chart PNG. Returns bytes or None."""
        if not MPL_AVAILABLE or not PANDAS_AVAILABLE:
            return None
        df = self._ohlcv_to_dataframe(ohlcv)
        if df is None or df.empty:
            return None
        try:
            style = mpf.make_mpf_style(
                base_mpf_style="nightclouds",
                marketcolors=mpf.make_marketcolors(
                    up="#10B981", down="#EF4444",
                    wick={"up": "#10B981", "down": "#EF4444"},
                    edge={"up": "#10B981", "down": "#EF4444"},
                    volume={"up": "#10B98166", "down": "#EF444466"},
                    ohlc="inherit",
                ),
                facecolor="#0f172a",
                edgecolor="#1e293b",
                gridcolor="#1e293b",
                gridstyle="--",
            )
            addplots = []
            if show_ma and len(df) > 20:
                ma20 = df["Close"].rolling(20).mean()
                ma50 = df["Close"].rolling(50).mean() if len(df) > 50 else None
                addplots.append(mpf.make_addplot(ma20, color="#F59E0B", width=1.2))
                if ma50 is not None:
                    addplots.append(mpf.make_addplot(ma50, color="#818CF8", width=1.2))

            plot_kwargs = {
                "type": "candle",
                "style": style,
                "volume": show_volume and "Volume" in df.columns,
                "returnfig": True,
                "figsize": (CHART_WIDTH_PX / DPI, CHART_HEIGHT_PX / DPI),
                "tight_layout": True,
            }
            if addplots:
                plot_kwargs["addplot"] = addplots

            fig, axes = mpf.plot(df, **plot_kwargs)
            buf = io.BytesIO()
            fig.savefig(buf, format="png", dpi=DPI, bbox_inches="tight",
                        facecolor="#0f172a")
            plt.close(fig)
            return buf.getvalue()
        except Exception as exc:
            logger.warning(f"Chart render failed: {exc}")
            return None

    def annotate_patterns(self,
                          chart_png: bytes,
                          patterns: List[Dict[str, Any]],
                          n_candles: int) -> bytes:
        """
        Draw bounding boxes and labels on chart_png using OpenCV.
        Falls back to matplotlib if OpenCV is unavailable.
        Returns annotated PNG bytes.
        """
        if not chart_png:
            return chart_png

        if CV2_AVAILABLE:
            return self._annotate_opencv(chart_png, patterns, n_candles)
        elif MPL_AVAILABLE and PIL_AVAILABLE:
            return self._annotate_matplotlib(chart_png, patterns, n_candles)
        return chart_png

    def _annotate_opencv(self, chart_png: bytes,
                          patterns: List[Dict[str, Any]],
                          n_candles: int) -> bytes:
        """OpenCV bounding box annotation."""
        try:
            arr = np.frombuffer(chart_png, dtype=np.uint8)
            img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            h, w = img.shape[:2]

            for pat in patterns:
                bbox = pat.get("bbox", [0.05, 0.1, 0.95, 0.9])
                if len(bbox) < 4:
                    continue
                x1 = int(bbox[0] * w)
                y1 = int(bbox[1] * h)
                x2 = int(bbox[2] * w)
                y2 = int(bbox[3] * h)

                sentiment = pat.get("sentiment", "Neutral")
                bgr = tuple(reversed(SENTIMENT_COLOURS.get(sentiment, (99, 102, 241))))

                conf = pat.get("confidence", 0)
                label = f"{pat['name']} {conf:.0f}%"

                # Rectangle
                cv2.rectangle(img, (x1, y1), (x2, y2), bgr, 2)
                # Label background
                (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                cv2.rectangle(img, (x1, y1 - th - 8), (x1 + tw + 6, y1), bgr, -1)
                cv2.putText(img, label, (x1 + 3, y1 - 4),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1,
                            cv2.LINE_AA)

            _, buf = cv2.imencode(".png", img)
            return buf.tobytes()
        except Exception as exc:
            logger.warning(f"OpenCV annotation failed: {exc}")
            return chart_png

    def _annotate_matplotlib(self, chart_png: bytes,
                              patterns: List[Dict[str, Any]],
                              n_candles: int) -> bytes:
        """Matplotlib fallback annotation."""
        try:
            img = Image.open(io.BytesIO(chart_png))
            fig, ax = plt.subplots(figsize=(img.width / DPI, img.height / DPI), dpi=DPI)
            ax.imshow(img)
            ax.axis("off")
            w, h = img.width, img.height

            for pat in patterns:
                bbox = pat.get("bbox", [0.05, 0.1, 0.95, 0.9])
                sentiment = pat.get("sentiment", "Neutral")
                rgb = tuple(c / 255 for c in SENTIMENT_COLOURS.get(sentiment, (99, 102, 241)))
                x1w = bbox[0] * w
                y1h = bbox[1] * h
                bw  = (bbox[2] - bbox[0]) * w
                bh  = (bbox[3] - bbox[1]) * h
                rect = patches.Rectangle(
                    (x1w, y1h), bw, bh,
                    linewidth=2, edgecolor=rgb, facecolor="none", alpha=0.85
                )
                ax.add_patch(rect)
                label = f"{pat['name']} {pat.get('confidence', 0):.0f}%"
                ax.text(x1w + 4, y1h + 4, label, color="white", fontsize=7,
                        backgroundcolor=rgb, va="top")

            buf = io.BytesIO()
            fig.savefig(buf, format="png", dpi=DPI, bbox_inches="tight")
            plt.close(fig)
            return buf.getvalue()
        except Exception as exc:
            logger.warning(f"Matplotlib annotation failed: {exc}")
            return chart_png

    def render_and_annotate(self,
                             ohlcv: List[Dict[str, Any]],
                             patterns: List[Dict[str, Any]]) -> Optional[str]:
        """
        Full pipeline: render chart + annotate + return base64 PNG string.
        Returns None if rendering unavailable.
        """
        chart = self.render_chart_png(ohlcv)
        if chart is None:
            return None
        if patterns:
            chart = self.annotate_patterns(chart, patterns, len(ohlcv))
        return base64.b64encode(chart).decode("utf-8")


chart_renderer = ChartRenderer()
