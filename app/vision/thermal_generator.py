"""
Thermal Image Generator — Phase 3 (unchanged in Phase 5)
Generates synthetic thermal array from RGB for simulation mode.
Used only when real thermal data is unavailable.
"""
import numpy as np
import cv2
import random
from pathlib import Path


def generate_from_rgb(rgb_path: str, inject_hotspot: bool | None = None) -> np.ndarray:
    img = cv2.imread(rgb_path)
    if img is None:
        return _blank_panel(inject_hotspot)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    inverted = 255 - gray.astype(np.float32)
    blurred  = cv2.GaussianBlur(inverted, (31, 31), 0)
    t_min, t_max = 35.0, 55.0
    thermal = (blurred / 255.0) * (t_max - t_min) + t_min
    thermal += np.random.normal(0, 0.5, (h, w)).astype(np.float32)
    should_inject = inject_hotspot if inject_hotspot is not None else random.random() < 0.70
    if should_inject:
        thermal = _inject_hotspot(thermal)
    return thermal.astype(np.float32)


def _blank_panel(inject_hotspot: bool | None) -> np.ndarray:
    base = np.random.normal(40.0, 1.0, (64, 64)).astype(np.float32)
    should = inject_hotspot if inject_hotspot is not None else random.random() < 0.70
    return _inject_hotspot(base) if should else base


def _inject_hotspot(thermal: np.ndarray) -> np.ndarray:
    h, w = thermal.shape
    cx = random.randint(int(w * 0.1), int(w * 0.9))
    cy = random.randint(int(h * 0.1), int(h * 0.9))
    delta = random.uniform(5.0, 50.0)
    sigma = random.uniform(max(h, w) * 0.04, max(h, w) * 0.12)
    y, x  = np.ogrid[:h, :w]
    dist_sq = (x - cx) ** 2 + (y - cy) ** 2
    hotspot = delta * np.exp(-dist_sq / (2 * sigma ** 2))
    return thermal + hotspot.astype(np.float32)


def save_array(array: np.ndarray, path: str) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    np.save(path, array)


def load_array(path: str) -> np.ndarray:
    return np.load(path).astype(np.float32)
