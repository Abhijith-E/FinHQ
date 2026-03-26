"""
Ensemble Inference
==================
Combines YOLOv8 + CNN+Transformer for production deployment.
Loads both pre-trained weight files and runs ensemble inference
on a chart image or OHLCV data.

Usage:
    python -m training.ensemble_inference \
        --yolo-weights  ./runs/yolo/pattern_detection/weights/best.pt \
        --cnn-weights   ./checkpoints/cnn_transformer_best.pt \
        --image         ./sample_chart.png
"""

from __future__ import annotations

import argparse
import base64
from pathlib import Path
from typing import List, Dict, Any, Optional

import numpy as np


def load_ensemble(yolo_weights: Optional[str] = None,
                  cnn_weights:  Optional[str] = None):
    """
    Load YOLOv8 and CNN+Transformer weights.
    Returns (yolo_model, cnn_model) — either may be None if weights unavailable.
    """
    yolo_model = None
    cnn_model  = None

    if yolo_weights and Path(yolo_weights).exists():
        try:
            from ultralytics import YOLO
            yolo_model = YOLO(yolo_weights)
            print(f"✓ YOLOv8 loaded from {yolo_weights}")
        except Exception as e:
            print(f"⚠ Could not load YOLO: {e}")

    if cnn_weights and Path(cnn_weights).exists():
        try:
            import torch
            from app.services.pattern_detection_service import (
                CNNTransformerPatternModel, PATTERNS
            )
            model = CNNTransformerPatternModel(n_classes=len(PATTERNS))
            state = torch.load(cnn_weights, map_location="cpu")
            model.load_state_dict(state)
            model.eval()
            cnn_model = model
            print(f"✓ CNN+Transformer loaded from {cnn_weights}")
        except Exception as e:
            print(f"⚠ Could not load CNN+Transformer: {e}")

    return yolo_model, cnn_model


def ensemble_predict_image(image_path: str,
                            yolo_model=None,
                            cnn_model=None,
                            yolo_weight: float = 0.55,
                            cnn_weight:  float = 0.45) -> List[Dict[str, Any]]:
    """
    Run ensemble prediction on a chart image file.
    Returns merged detection list.
    """
    from app.services.pattern_detection_service import PATTERNS, PATTERN_SENTIMENT
    results = {}

    # 1. YOLOv8 detections
    if yolo_model is not None:
        try:
            preds = yolo_model(image_path, verbose=False)
            for pred in preds:
                for box in pred.boxes:
                    cls_id = int(box.cls[0])
                    conf   = float(box.conf[0])
                    pattern = PATTERNS[cls_id] if cls_id < len(PATTERNS) else "unknown"
                    xyxyn = box.xyxyn[0].tolist()
                    if pattern not in results or results[pattern]["yolo_conf"] < conf:
                        results[pattern] = {"yolo_conf": conf, "bbox": xyxyn}
        except Exception as e:
            print(f"YOLO inference error: {e}")

    # 2. CNN+Transformer detections
    if cnn_model is not None:
        try:
            import torch
            from PIL import Image
            img = Image.open(image_path).convert("L").resize((64, 5))
            arr = np.array(img, dtype=np.float32) / 255.0
            tensor = torch.tensor(arr).unsqueeze(0)   # (1, 5, 64)
            with torch.no_grad():
                logits = cnn_model(tensor)
                probs  = torch.softmax(logits, -1).squeeze(0).numpy()
            for i, p in enumerate(probs):
                pattern = PATTERNS[i]
                if pattern not in results:
                    results[pattern] = {"yolo_conf": 0.0, "bbox": [0.05, 0.05, 0.95, 0.95]}
                results[pattern]["cnn_conf"] = float(p)
        except Exception as e:
            print(f"CNN inference error: {e}")

    # 3. Blend
    final = []
    for pattern, scores in results.items():
        yc = scores.get("yolo_conf", 0.0)
        cc = scores.get("cnn_conf",  0.0)
        if yc == 0.0 and cc == 0.0:
            continue
        # Normalise weights if only one model available
        w_y = yolo_weight if yolo_model else 0
        w_c = cnn_weight  if cnn_model  else 0
        denom = w_y + w_c + 1e-9
        blended = (yc * w_y + cc * w_c) / denom
        final.append({
            "name":       pattern,
            "confidence": round(blended * 100, 1),
            "strength":   round(blended * 85, 1),
            "bbox":       scores.get("bbox", [0.05, 0.05, 0.95, 0.95]),
            "sentiment":  PATTERN_SENTIMENT.get(pattern, "Neutral"),
            "timeframe":  "inferred",
        })

    return sorted(final, key=lambda x: x["confidence"], reverse=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--yolo-weights", default=None, type=str)
    parser.add_argument("--cnn-weights",  default=None, type=str)
    parser.add_argument("--image",        required=True, type=str)
    args = parser.parse_args()

    yolo, cnn = load_ensemble(args.yolo_weights, args.cnn_weights)
    detections = ensemble_predict_image(args.image, yolo, cnn)
    import json
    print(json.dumps(detections, indent=2))
