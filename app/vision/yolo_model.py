"""
YOLO Model — Phase 4 (unchanged in Phase 5)

Loads a YOLOv8 model (fine-tuned or base) and runs inference
on solar panel RGB images.

Model priority:
  1. Fine-tuned weights at models/yolov8_solar.pt  ← after training
  2. Base yolov8n.pt downloaded by ultralytics      ← before training

The fine-tuned model detects four fault classes:
  0: dirt
  1: crack
  2: shadow
  3: obstruction
"""
import logging
from pathlib import Path
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

FINE_TUNED_PATH = Path("models/yolov8_solar.pt")
BASE_MODEL      = "yolov8n.pt"
CLASS_NAMES     = {0: "dirt", 1: "crack", 2: "shadow", 3: "obstruction"}
CONF_THRESHOLD  = 0.45

_model = None


@dataclass
class Detection:
    fault_type: str
    confidence: float
    bbox: list[float]   # [x1, y1, x2, y2] normalised 0–1


@dataclass
class YOLOResult:
    detections: list[Detection] = field(default_factory=list)
    image_width: int = 0
    image_height: int = 0

    @property
    def best(self) -> Detection | None:
        if not self.detections:
            return None
        return max(self.detections, key=lambda d: d.confidence)


def _get_model():
    global _model
    if _model is not None:
        return _model
    try:
        from ultralytics import YOLO
        if FINE_TUNED_PATH.exists():
            logger.info(f"Loading fine-tuned model: {FINE_TUNED_PATH}")
            _model = YOLO(str(FINE_TUNED_PATH))
        else:
            logger.warning(
                f"Fine-tuned model not found at {FINE_TUNED_PATH}. "
                f"Loading base model '{BASE_MODEL}'. "
                f"Run notebooks/train_yolov8.ipynb to fine-tune."
            )
            _model = YOLO(BASE_MODEL)
        return _model
    except ImportError:
        logger.error("ultralytics not installed. Run: pip install ultralytics")
        return None


import numpy as np

def predict(source: str | np.ndarray) -> YOLOResult:
    """Run YOLO inference on an RGB image (path or numpy array)."""
    model = _get_model()
    if model is None:
        return YOLOResult()

    try:
        results = model.predict(source=source, conf=CONF_THRESHOLD, verbose=False)
    except Exception as e:
        logger.error(f"YOLO inference failed: {e}")
        return YOLOResult()

    result     = results[0]
    h, w       = result.orig_shape
    detections = []
    for box in result.boxes:
        cls_id     = int(box.cls[0])
        conf       = float(box.conf[0])
        xyxyn      = box.xyxyn[0].tolist()
        fault_type = CLASS_NAMES.get(cls_id, f"class_{cls_id}")
        detections.append(Detection(fault_type=fault_type, confidence=round(conf, 3), bbox=xyxyn))

    detections.sort(key=lambda d: d.confidence, reverse=True)
    logger.debug(f"YOLO | {len(detections)} detections in {image_path}")
    return YOLOResult(detections=detections, image_width=w, image_height=h)
