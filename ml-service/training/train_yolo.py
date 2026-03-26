"""
YOLOv8 Training Entry Point
============================
Trains an Ultralytics YOLOv8 model on the generated dataset.
Requires `ultralytics` to be installed.

Usage:
    pip install ultralytics
    python -m training.train_yolo \
        --data-yaml ./dataset/dataset.yaml \
        --output-dir ./runs/yolo \
        --epochs 100 \
        --model yolov8n.pt
"""

from __future__ import annotations

import argparse
from pathlib import Path


def train_yolo(data_yaml: str, output_dir: str, epochs: int = 100,
               imgsz: int = 800, model: str = "yolov8n.pt",
               batch: int = 16, device: str = "auto"):
    try:
        from ultralytics import YOLO
    except ImportError:
        raise ImportError(
            "ultralytics not installed. "
            "Install with: pip install ultralytics>=8.0"
        )

    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    if device == "auto":
        import torch
        device = "0" if torch.cuda.is_available() else "cpu"

    print(f"Loading YOLOv8 base model: {model}")
    yolo = YOLO(model)

    print(f"Starting training: {epochs} epochs, device={device}, imgsz={imgsz}")
    results = yolo.train(
        data          = data_yaml,
        epochs        = epochs,
        imgsz         = imgsz,
        batch         = batch,
        device        = device,
        project       = str(out),
        name          = "pattern_detection",
        patience      = 20,            # early stopping
        save          = True,
        plots         = True,
        augment       = True,          # Ultralytics built-in augment
        mosaic        = 1.0,
        mixup         = 0.1,
        copy_paste    = 0.1,
        label_smoothing = 0.1,
        warmup_epochs = 3,
        cos_lr        = True,
        lr0           = 0.01,
        lrf           = 0.001,
        optimizer     = "AdamW",
        weight_decay  = 5e-4,
        # Multi-scale training
        multi_scale   = True,
    )

    best_weights = out / "pattern_detection" / "weights" / "best.pt"
    print(f"\n✓ YOLOv8 training complete.")
    print(f"  Best weights: {best_weights}")
    print(f"  mAP50: {results.results_dict.get('metrics/mAP50(B)', 'N/A')}")
    return str(best_weights)


def validate_yolo(weights: str, data_yaml: str, imgsz: int = 800):
    try:
        from ultralytics import YOLO
    except ImportError:
        raise ImportError("Install ultralytics: pip install ultralytics>=8.0")
    model = YOLO(weights)
    metrics = model.val(data=data_yaml, imgsz=imgsz)
    print(f"mAP50:   {metrics.box.map50:.4f}")
    print(f"mAP50-95:{metrics.box.map:.4f}")
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train YOLOv8 pattern detector")
    parser.add_argument("--data-yaml",   required=True,               type=str)
    parser.add_argument("--output-dir",  default="./runs/yolo",       type=str)
    parser.add_argument("--epochs",      default=100,                  type=int)
    parser.add_argument("--imgsz",       default=800,                  type=int)
    parser.add_argument("--model",       default="yolov8n.pt",         type=str)
    parser.add_argument("--batch",       default=16,                   type=int)
    parser.add_argument("--device",      default="auto",               type=str)
    parser.add_argument("--validate",    action="store_true")
    args = parser.parse_args()

    if args.validate:
        validate_yolo(args.output_dir + "/pattern_detection/weights/best.pt",
                      args.data_yaml, args.imgsz)
    else:
        train_yolo(args.data_yaml, args.output_dir, args.epochs,
                   args.imgsz, args.model, args.batch, args.device)
