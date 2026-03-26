"""
Dataset Generator for AI Stock Chart Pattern Detection
=======================================================
Generates synthetic OHLCV data for each of 12 classical chart patterns,
renders high-res candlestick PNG images with mplfinance, and creates
YOLO-format annotation files.

Usage:
    python -m training.dataset_generator --output-dir ./dataset --n-per-pattern 1700

This produces ~20,000 annotated chart images (1700 × 12 patterns, with augmentation).
"""

from __future__ import annotations

import argparse
import os
import json
import random
import shutil
from pathlib import Path
from typing import List, Tuple, Dict

import numpy as np

try:
    import mplfinance as mpf
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import pandas as pd
    RENDER_AVAILABLE = True
except ImportError:
    RENDER_AVAILABLE = False
    print("mplfinance/pandas not installed — install with: pip install mplfinance pandas")

try:
    from PIL import Image, ImageFilter, ImageEnhance
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

# ── Pattern ID registry ──────────────────────────────────────────────────────

PATTERN_IDS: Dict[str, int] = {
    "head_and_shoulders":          0,
    "inverse_head_and_shoulders":  1,
    "double_top":                  2,
    "double_bottom":               3,
    "ascending_triangle":          4,
    "descending_triangle":         5,
    "symmetrical_triangle":        6,
    "cup_and_handle":              7,
    "flag_pattern":                8,
    "pennant":                     9,
    "channel_pattern":             10,
    "w_bottom":                    11,
    "m_top":                       12,
    "breakout":                    13,
}

TIMEFRAMES = ["1m", "5m", "15m", "1h", "1d"]


# ── OHLCV Generators ─────────────────────────────────────────────────────────

def _gbm(n: int, start: float = 100.0, vol: float = 0.01) -> np.ndarray:
    """Geometric Brownian Motion price series."""
    dt = 1.0
    returns = np.random.normal(0, vol * np.sqrt(dt), n)
    prices = start * np.exp(np.cumsum(returns))
    return prices


def _make_candles(closes: np.ndarray, noise: float = 0.005) -> pd.DataFrame:
    """Convert close prices to OHLCV DataFrame."""
    n = len(closes)
    highs  = closes * (1 + np.abs(np.random.normal(0, noise, n)))
    lows   = closes * (1 - np.abs(np.random.normal(0, noise, n)))
    opens  = np.roll(closes, 1)
    opens[0] = closes[0]
    volumes = np.random.randint(100_000, 5_000_000, n).astype(float)
    index = pd.date_range("2022-01-01", periods=n, freq="D")
    df = pd.DataFrame({
        "Open": opens, "High": highs, "Low": lows,
        "Close": closes, "Volume": volumes
    }, index=index)
    # Ensure OHLC integrity
    df["High"]  = df[["Open", "High", "Close"]].max(axis=1)
    df["Low"]   = df[["Open", "Low",  "Close"]].min(axis=1)
    return df


def generate_head_and_shoulders(n: int = 80) -> Tuple[pd.DataFrame, List[float]]:
    base = _gbm(n // 4, 100, 0.01)[-1]
    left   = _up_then_down(n // 4, base, 0.08)
    mid    = _up_then_down(n // 4, left[-1], 0.14)
    right  = _up_then_down(n // 4, mid[-1], 0.08)
    tail   = _gbm(n - 3 * (n // 4), right[-1], 0.012) * (1 - 0.03)
    closes = np.concatenate([left, mid, right, tail])
    bbox = [0.05, 0.05, 0.95, 0.95]
    return _make_candles(closes), bbox


def generate_double_top(n: int = 80) -> Tuple[pd.DataFrame, List[float]]:
    h = 0.10
    leg1 = np.linspace(100, 100 * (1 + h), n // 3)
    leg2 = np.linspace(100 * (1 + h), 100, n // 6)
    leg3 = np.linspace(100, 100 * (1 + h * 0.97), n // 3)
    tail = np.linspace(100 * (1 + h * 0.97), 100 * 0.92, n - len(leg1) - len(leg2) - len(leg3))
    closes = np.concatenate([leg1, leg2, leg3, tail])
    noise = np.random.normal(0, 0.003, len(closes))
    closes = closes * (1 + noise)
    return _make_candles(closes), [0.05, 0.05, 0.95, 0.95]


def generate_double_bottom(n: int = 80) -> Tuple[pd.DataFrame, List[float]]:
    h = 0.10
    leg1 = np.linspace(100, 100 * (1 - h), n // 3)
    leg2 = np.linspace(100 * (1 - h), 100, n // 6)
    leg3 = np.linspace(100, 100 * (1 - h * 0.97), n // 3)
    tail = np.linspace(100 * (1 - h * 0.97), 100 * 1.08, n - len(leg1) - len(leg2) - len(leg3))
    closes = np.concatenate([leg1, leg2, leg3, tail])
    noise = np.random.normal(0, 0.003, len(closes))
    closes = closes * (1 + noise)
    return _make_candles(closes), [0.05, 0.05, 0.95, 0.95]


def generate_ascending_triangle(n: int = 80) -> Tuple[pd.DataFrame, List[float]]:
    resistance = 110.0
    x = np.arange(n)
    support_line = 100 + 0.12 * x
    closes = support_line + np.random.normal(0, 0.5, n)
    # Cap at resistance
    closes = np.minimum(closes, resistance + np.random.normal(0, 0.2, n))
    return _make_candles(closes), [0.05, 0.05, 0.95, 0.95]


def generate_cup_and_handle(n: int = 80) -> Tuple[pd.DataFrame, List[float]]:
    cup = np.concatenate([
        np.linspace(100, 85, n // 3),
        np.linspace(85, 100, n // 3)
    ])
    handle = np.linspace(100, 95, n // 6) + np.random.normal(0, 0.3, n // 6)
    breakout = np.linspace(95, 108, n - len(cup) - len(handle))
    closes = np.concatenate([cup, handle, breakout])
    return _make_candles(closes), [0.0, 0.0, 1.0, 1.0]


def generate_flag_pattern(n: int = 80) -> Tuple[pd.DataFrame, List[float]]:
    pole   = np.linspace(100, 130, n // 3)
    flag   = 130 - 0.05 * np.arange(n // 2) + np.random.normal(0, 0.3, n // 2)
    rest   = np.linspace(flag[-1], flag[-1] * 1.10, n - len(pole) - len(flag))
    closes = np.concatenate([pole, flag, rest])
    return _make_candles(closes), [0.0, 0.0, 1.0, 1.0]


def generate_generic_pattern(name: str, n: int = 80) -> Tuple[pd.DataFrame, List[float]]:
    """Fallback for remaining pattern types with GBM + trend."""
    trend = {"inverse_head_and_shoulders": 0.03, "w_bottom": 0.04,
             "channel_pattern": 0.01, "pennant": 0.005,
             "symmetrical_triangle": 0.0, "descending_triangle": -0.01,
             "m_top": -0.02, "breakout": 0.05}.get(name, 0.0)
    x = np.arange(n)
    closes = 100 + trend * x + _gbm(n, 0, 0.01) - 100
    closes = np.maximum(closes, 1.0)
    return _make_candles(closes), [0.05, 0.05, 0.95, 0.95]


GENERATORS = {
    "head_and_shoulders":         generate_head_and_shoulders,
    "double_top":                 generate_double_top,
    "double_bottom":              generate_double_bottom,
    "ascending_triangle":         generate_ascending_triangle,
    "cup_and_handle":             generate_cup_and_handle,
    "flag_pattern":               generate_flag_pattern,
}


# ── Helper ────────────────────────────────────────────────────────────────────

def _up_then_down(n: int, start: float, move: float) -> np.ndarray:
    mid = start * (1 + move)
    up   = np.linspace(start, mid,   n // 2)
    down = np.linspace(mid,   start, n - n // 2)
    return np.concatenate([up, down]) * (1 + np.random.normal(0, 0.003, n))


# ── Augmentation ──────────────────────────────────────────────────────────────

def augment_image(img_path: Path) -> List[Path]:
    """Apply augmentations and return list of new image paths."""
    if not PIL_AVAILABLE:
        return []
    aug_paths = []
    img = Image.open(img_path)

    # 1. Gaussian noise
    noisy = img.filter(ImageFilter.GaussianBlur(radius=0.5))
    p = img_path.with_name(img_path.stem + "_noise.jpg")
    noisy.save(p, quality=90)
    aug_paths.append(p)

    # 2. Contrast variation
    enhancer = ImageEnhance.Contrast(img)
    contrast = enhancer.enhance(random.uniform(0.7, 1.4))
    p = img_path.with_name(img_path.stem + "_contrast.jpg")
    contrast.save(p, quality=90)
    aug_paths.append(p)

    # 3. Brightness
    bright = ImageEnhance.Brightness(img).enhance(random.uniform(0.8, 1.2))
    p = img_path.with_name(img_path.stem + "_bright.jpg")
    bright.save(p, quality=90)
    aug_paths.append(p)

    # 4. Horizontal flip (simulates different chart direction)
    flipped = img.transpose(Image.FLIP_LEFT_RIGHT)
    p = img_path.with_name(img_path.stem + "_flip.jpg")
    flipped.save(p, quality=90)
    aug_paths.append(p)

    return aug_paths


# ── Chart Renderer ────────────────────────────────────────────────────────────

DARK_STYLE = None

def _get_style():
    global DARK_STYLE
    if DARK_STYLE is None and RENDER_AVAILABLE:
        DARK_STYLE = mpf.make_mpf_style(
            base_mpf_style="nightclouds",
            marketcolors=mpf.make_marketcolors(
                up="#10B981", down="#EF4444",
                wick={"up": "#10B981", "down": "#EF4444"},
                edge={"up": "#10B981", "down": "#EF4444"},
                volume={"up": "#10B98166", "down": "#EF444466"},
            ),
            facecolor="#0f172a",
            edgecolor="#1e293b",
            gridcolor="#1e293b",
        )
    return DARK_STYLE


def render_chart(df: pd.DataFrame, out_path: Path,
                 show_volume: bool = True):
    """Render candlestick chart and save to disk."""
    if not RENDER_AVAILABLE:
        return
    with_ma = len(df) > 20
    addplots = []
    if with_ma:
        ma20 = df["Close"].rolling(20).mean()
        addplots.append(mpf.make_addplot(ma20, color="#F59E0B", width=1.0))
    fig, _ = mpf.plot(
        df, type="candle", style=_get_style(),
        volume=show_volume,
        addplot=addplots if addplots else None,
        returnfig=True,
        figsize=(8, 5), tight_layout=True,
    )
    fig.savefig(str(out_path), dpi=100, bbox_inches="tight",
                facecolor="#0f172a")
    plt.close(fig)


# ── YOLO annotation writer ────────────────────────────────────────────────────

def write_yolo_annotation(label_path: Path, class_id: int,
                           bbox: List[float]):
    """
    Write YOLO annotation: class_id cx cy w h (normalised 0-1).
    bbox is [x1, y1, x2, y2] normalised.
    """
    x1, y1, x2, y2 = bbox
    cx = (x1 + x2) / 2
    cy = (y1 + y2) / 2
    w  = x2 - x1
    h  = y2 - y1
    label_path.write_text(f"{class_id} {cx:.4f} {cy:.4f} {w:.4f} {h:.4f}\n")


# ── YOLO Dataset YAML ─────────────────────────────────────────────────────────

def write_dataset_yaml(output_dir: Path):
    names = list(PATTERN_IDS.keys())
    yaml_content = f"""# Auto-generated YOLO dataset config
path: {output_dir.absolute()}
train: images/train
val:   images/val
test:  images/test

nc: {len(names)}
names: {names}
"""
    (output_dir / "dataset.yaml").write_text(yaml_content)
    print(f"Dataset YAML written to {output_dir / 'dataset.yaml'}")


# ── Main generation loop ──────────────────────────────────────────────────────

def generate_dataset(output_dir: str, n_per_pattern: int = 1700,
                     val_split: float = 0.15, test_split: float = 0.05):
    """
    Generate a full annotated dataset.
    Default: 1700 × 14 patterns × ~4 augmentations ≈ 95,000 images
    (n_per_pattern=1700 → ~20,000 base + augmented to 95K)
    """
    out = Path(output_dir)
    for split in ["train", "val", "test"]:
        (out / "images" / split).mkdir(parents=True, exist_ok=True)
        (out / "labels" / split).mkdir(parents=True, exist_ok=True)

    total = 0
    for pattern_name, class_id in PATTERN_IDS.items():
        print(f"Generating '{pattern_name}' (class {class_id}) ...")
        gen_fn = GENERATORS.get(pattern_name,
                                 lambda n=80: generate_generic_pattern(pattern_name, n))
        for i in range(n_per_pattern):
            # Randomise candle count and timeframe
            n_candles = random.randint(40, 120)
            tf = random.choice(TIMEFRAMES)

            # Generate OHLCV + bbox
            try:
                df, bbox = gen_fn(n_candles)
            except Exception:
                df, bbox = generate_generic_pattern(pattern_name, n_candles)

            # Split assignment
            r = random.random()
            split = "test" if r < test_split else "val" if r < val_split + test_split else "train"

            stem = f"{pattern_name}_{tf}_{i:05d}"
            img_path   = out / "images" / split / f"{stem}.png"
            label_path = out / "labels" / split / f"{stem}.txt"

            render_chart(df, img_path)
            write_yolo_annotation(label_path, class_id, bbox)

            # Augment (train only)
            if split == "train":
                aug_imgs = augment_image(img_path)
                for aug_img in aug_imgs:
                    aug_label = label_path.parent.parent.parent / "labels" / split / (aug_img.stem + ".txt")
                    write_yolo_annotation(aug_label, class_id, bbox)
                    # Move to labels dir (already there, just write)
                    shutil.copy(aug_img, out / "images" / split / aug_img.name)
                    aug_img.unlink(missing_ok=True)
                total += len(aug_imgs)

            total += 1

    write_dataset_yaml(out)
    print(f"\n✓ Dataset generation complete. Total images: {total}")
    print(f"  Output: {out.absolute()}")


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate chart pattern dataset")
    parser.add_argument("--output-dir",      default="./dataset",    type=str)
    parser.add_argument("--n-per-pattern",   default=1700,           type=int)
    parser.add_argument("--val-split",       default=0.15,           type=float)
    parser.add_argument("--test-split",      default=0.05,           type=float)
    args = parser.parse_args()

    generate_dataset(args.output_dir, args.n_per_pattern, args.val_split, args.test_split)
