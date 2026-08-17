"""
Image Annotator — Phase 4 (unchanged in Phase 5)
Draws bounding boxes on RGB images, saves annotated images.
"""
import logging
from pathlib import Path
import cv2
import numpy as np
from app.vision.yolo_model import YOLOResult, Detection
from app.config import settings

logger = logging.getLogger(__name__)

FAULT_COLOURS = {
    "dirt":         (0,   165, 255),
    "crack":        (0,   0,   255),
    "shadow":       (255, 144, 30),
    "obstruction":  (0,   255, 255),
    "thermal-only": (255, 0,   255),
}
DEFAULT_COLOUR = (128, 128, 128)
FONT       = cv2.FONT_HERSHEY_SIMPLEX
FONT_SCALE = 0.55
THICKNESS  = 2


def annotate(rgb_image_path: str, yolo_result: YOLOResult) -> str | None:
    full_path = Path(settings.image_storage_path) / rgb_image_path
    img       = cv2.imread(str(full_path))
    if img is None:
        logger.warning(f"Could not load image for annotation: {full_path}")
        return None

    if not yolo_result.detections:
        img = _stamp_healthy(img)
    else:
        h, w = img.shape[:2]
        for det in yolo_result.detections:
            img = _draw_box(img, det, w, h)

    stem          = Path(rgb_image_path).stem
    annotated_dir = Path(settings.image_storage_path) / "annotated"
    annotated_dir.mkdir(parents=True, exist_ok=True)
    out_path = annotated_dir / f"{stem}_annotated.jpg"
    cv2.imwrite(str(out_path), img)
    logger.debug(f"Annotated image saved: {out_path}")
    return str(Path("annotated") / f"{stem}_annotated.jpg")


def _draw_box(img: np.ndarray, det: Detection, w: int, h: int) -> np.ndarray:
    x1, y1, x2, y2 = det.bbox
    px1, py1, px2, py2 = int(x1*w), int(y1*h), int(x2*w), int(y2*h)
    colour = FAULT_COLOURS.get(det.fault_type, DEFAULT_COLOUR)
    label  = f"{det.fault_type} {det.confidence:.0%}"
    cv2.rectangle(img, (px1, py1), (px2, py2), colour, THICKNESS)
    (lw, lh), baseline = cv2.getTextSize(label, FONT, FONT_SCALE, 1)
    cv2.rectangle(img, (px1, py1 - lh - baseline - 4), (px1 + lw + 4, py1), colour, -1)
    cv2.putText(img, label, (px1 + 2, py1 - baseline - 2), FONT, FONT_SCALE, (255, 255, 255), 1, cv2.LINE_AA)
    return img


def _stamp_healthy(img: np.ndarray) -> np.ndarray:
    h, w = img.shape[:2]
    label = "HEALTHY"
    (lw, lh), _ = cv2.getTextSize(label, FONT, 1.2, 2)
    cv2.putText(img, label, ((w - lw) // 2, (h + lh) // 2), FONT, 1.2, (0, 200, 0), 2, cv2.LINE_AA)
    return img
