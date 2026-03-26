# AI Pattern Detection — Training Pipeline

## Quick Start

### 1. Install extra training dependencies
```bash
cd ml-service
pip install mplfinance matplotlib pillow scipy ultralytics
```

### 2. Generate Dataset (~20K images)
```bash
python -m training.dataset_generator \
    --output-dir ./dataset \
    --n-per-pattern 1700
```
- Generates 1700 images × 14 patterns × ~4 augmentations ≈ **95K images**
- For a lighter dataset use `--n-per-pattern 150` (~8K images)
- Output structure:
  ```
  dataset/
    images/{train,val,test}/
    labels/{train,val,test}/
    dataset.yaml
  ```

### 3. Train CNN+Transformer (CPU/GPU)
```bash
python -m training.train_cnn_transformer \
    --dataset-dir ./dataset \
    --output-dir  ./checkpoints \
    --epochs 50
```
Output: `checkpoints/cnn_transformer_best.pt`

**GPU training:** Automatically uses CUDA if available.

### 4. Train YOLOv8 (optional, GPU recommended)
```bash
python -m training.train_yolo \
    --data-yaml ./dataset/dataset.yaml \
    --output-dir ./runs/yolo \
    --model yolov8n.pt \
    --epochs 100 \
    --imgsz 800
```
Output: `runs/yolo/pattern_detection/weights/best.pt`

### 5. Load weights in production
Once trained, the ml-service will auto-load weights at startup if placed here:
```
ml-service/models/cnn_transformer_best.pt
ml-service/models/yolo_best.pt
```

Or call at runtime:
```python
from app.services.pattern_detection_service import pattern_detection_service
pattern_detection_service.load_weights("./models/cnn_transformer_best.pt")
```

### 6. Ensemble inference on an image
```bash
python -m training.ensemble_inference \
    --yolo-weights ./runs/yolo/pattern_detection/weights/best.pt \
    --cnn-weights  ./checkpoints/cnn_transformer_best.pt \
    --image        ./sample_chart.png
```

---

## Timeframes Supported
- `1m`, `5m`, `15m`, `1h`, `1d`

## Patterns Detected
| ID | Pattern | Sentiment |
|----|---------|-----------|
| 0 | Head and Shoulders | Bearish |
| 1 | Inverse Head and Shoulders | Bullish |
| 2 | Double Top | Bearish |
| 3 | Double Bottom | Bullish |
| 4 | Ascending Triangle | Bullish |
| 5 | Descending Triangle | Bearish |
| 6 | Symmetrical Triangle | Neutral |
| 7 | Cup and Handle | Bullish |
| 8 | Flag Pattern | Bullish |
| 9 | Pennant | Bullish |
| 10 | Channel Pattern | Neutral |
| 11 | W Bottom | Bullish |
| 12 | M Top | Bearish |
| 13 | Support Resistance Breakout | Bullish |

## Augmentations Applied
- Gaussian blur (candlestick distortion simulation)
- Contrast variation ±30%
- Brightness variation ±20%
- Horizontal flip (direction reversal)

## How it Outperforms the HuggingFace Baseline
1. **Algorithmic verification layer** — every AI detection is cross-validated against strict geometric rules (neckline slope, peak symmetry, trendline R²), eliminating false positives
2. **Two-model ensemble** — YOLOv8 object detector + CNN+Transformer classifier with weighted blending
3. **NMS deduplication** — 1D IoU-based suppression removes redundant detections
4. **More pattern classes** — 14 vs 6 in the baseline
5. **Real OHLCV structural analysis** — not just image pixels, but actual price geometry
