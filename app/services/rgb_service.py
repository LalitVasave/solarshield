"""
RGB Analysis Service — Phase 4 (unchanged in Phase 5)
Real RGB fault detection using YOLOv8.
"""
import logging
from dataclasses import dataclass
from pathlib import Path
from app.config import settings
from app.vision.yolo_model import predict
from app.vision.annotator import annotate

logger = logging.getLogger(__name__)


@dataclass
class RGBResult:
    fault_type: str | None
    confidence: float
    annotated_image_path: str | None = None
    detection_count: int = 0


def analyse(image_path: str) -> RGBResult:
    full_path  = str(Path(settings.image_storage_path) / image_path)
    yolo_result = predict(full_path)
    annotated_path = annotate(image_path, yolo_result)
    best = yolo_result.best

    if best is None:
        logger.info(f"RGB | no fault detected | image={image_path}")
        return RGBResult(
            fault_type=None,
            confidence=0.10,
            annotated_image_path=annotated_path,
            detection_count=0
        )

    logger.info(
        f"RGB | fault={best.fault_type} conf={best.confidence} "
        f"detections={len(yolo_result.detections)} image={image_path}"
    )
    return RGBResult(
        fault_type=best.fault_type,
        confidence=best.confidence,
        annotated_image_path=annotated_path,
        detection_count=len(yolo_result.detections)
    )
