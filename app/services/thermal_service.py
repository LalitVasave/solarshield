"""
Thermal IR Analysis Service — Phase 5

Updated: tries colormap decode on real JPEG thermal images first,
before falling back to synthetic generation.

Priority order for thermal data:
  1. .npy array at the same path (real FLIR radiometric data)
  2. Colormap JPEG decode (your drone's thermal colormap exports)  ← NEW in Phase 5
  3. Generate from RGB (simulation fallback)
  4. Blank array (last resort)
"""
import logging
import numpy as np
import cv2
from dataclasses import dataclass
from pathlib import Path
from app.config import settings
from app.vision.thermal_generator import generate_from_rgb, load_array
from app.vision.coregistration import align_thermal_to_rgb
from app.vision.colormap_decoder import decode_colormap_to_celsius

logger = logging.getLogger(__name__)


@dataclass
class ThermalResult:
    severity: str
    delta_t: float
    hotspot_count: int
    max_temp: float
    median_temp: float


SEVERITY_THRESHOLDS = {
    "NONE":   (0.0,  5.0),
    "LOW":    (5.0,  15.0),
    "MEDIUM": (15.0, 30.0),
    "HIGH":   (30.0, float("inf"))
}


def _score_severity(delta_t: float) -> str:
    for label, (low, high) in SEVERITY_THRESHOLDS.items():
        if low <= delta_t < high:
            return label
    return "HIGH"


def _detect_hotspots(thermal: np.ndarray, threshold_delta: float = 5.0) -> tuple[int, np.ndarray]:
    median_temp = float(np.median(thermal))
    threshold   = median_temp + threshold_delta
    _, binary   = cv2.threshold(thermal, threshold, 255, cv2.THRESH_BINARY)
    binary      = binary.astype(np.uint8)
    kernel      = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    binary      = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    significant = [c for c in contours if cv2.contourArea(c) >= 9]
    return len(significant), binary


def _load_thermal_array(thermal_image_path: str, rgb_image_path: str) -> np.ndarray:
    """
    Load thermal data using the best available source.

    Priority:
      1. .npy array (raw radiometric data from FLIR SDK)
      2. Colormap JPEG decode (your drone's pseudocolor thermal export)
      3. Synthetic generation from RGB (simulation mode)
      4. Blank array fallback
    """
    base_path = Path(settings.image_storage_path) / thermal_image_path
    npy_path  = base_path.with_suffix(".npy")

    # 1. Raw .npy array (best — actual temperatures)
    if npy_path.exists():
        logger.info(f"Loading thermal array from .npy: {npy_path}")
        return load_array(str(npy_path))

    # 2. Colormap JPEG decode (real drone thermal images)
    if base_path.exists() and base_path.suffix.lower() in (".jpg", ".jpeg", ".png"):
        logger.info(f"Decoding colormap thermal image: {base_path}")
        return decode_colormap_to_celsius(str(base_path))

    # 3. Synthetic generation from RGB (simulation fallback)
    rgb_full_path = str(Path(settings.image_storage_path) / rgb_image_path)
    if Path(rgb_full_path).exists():
        logger.warning(f"No real thermal found — generating synthetic from RGB: {rgb_full_path}")
        return generate_from_rgb(rgb_full_path)

    # 4. Blank array (last resort)
    logger.error("No thermal source available — using blank array")
    return np.random.normal(40.0, 1.0, (64, 64)).astype(np.float32)


def analyse(thermal_image_path: str, rgb_image_path: str = "") -> ThermalResult:
    """Run the full thermal analysis pipeline on one image pair."""
    thermal     = _load_thermal_array(thermal_image_path, rgb_image_path)
    thermal     = align_thermal_to_rgb(thermal, thermal.shape[:2])
    median_temp = float(np.median(thermal))
    max_temp    = float(np.max(thermal))
    delta_t     = round(max_temp - median_temp, 2)
    hotspot_count, _ = _detect_hotspots(thermal, threshold_delta=5.0)
    severity    = _score_severity(delta_t)

    logger.info(
        f"Thermal | median={median_temp:.1f}°C max={max_temp:.1f}°C "
        f"delta_t={delta_t}°C hotspots={hotspot_count} severity={severity}"
    )
    return ThermalResult(
        severity=severity,
        delta_t=delta_t,
        hotspot_count=hotspot_count,
        max_temp=round(max_temp, 2),
        median_temp=round(median_temp, 2)
    )
