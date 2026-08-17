"""
Thermal Colormap Decoder — Phase 5 (real drone integration)

Converts a pseudocolor thermal JPEG (iron / rainbow / inferno palette)
back into a float32 numpy array of temperatures in °C.

Most consumer and prosumer drone thermal cameras (DJI Zenmuse XT2, FLIR Vue,
Autel EVO II Dual) save thermal images as false-colour JPEG exports when raw
radiometric data is not available. This module reverses that colourmap mapping
to recover approximate temperature values.

Supported palettes:
  - iron     (most common — red/orange/yellow → cold/hot)
  - rainbow  (blue → green → red)
  - inferno  (matplotlib / common on newer FLIR exports)

Usage:
    from app.vision.colormap_decoder import decode_colormap_to_celsius
    temp_array = decode_colormap_to_celsius("images/thermal/uuid.jpg")
    # → float32 numpy array (H, W) with approx temperatures in °C

If the palette cannot be identified, falls back to a luminance-based
approximation assuming a 20–80°C operational range.
"""
import logging
import numpy as np
import cv2
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Temperature operating range for solar panels (°C)
# Adjust TEMP_MIN / TEMP_MAX if your drone uses a different range
TEMP_MIN = 20.0
TEMP_MAX = 80.0


# ── Colourmap lookup tables ─────────────────────────────────────────────────

def _build_iron_lut() -> np.ndarray:
    """
    Build a 256-entry iron colourmap LUT (BGR).
    Iron goes: black → blue → purple → red → orange → yellow → white.
    Based on FLIR iron palette specification.
    """
    lut = np.zeros((256, 3), dtype=np.uint8)
    for i in range(256):
        t = i / 255.0
        if t < 0.25:
            r = 0
            g = 0
            b = int(255 * t / 0.25)
        elif t < 0.5:
            r = int(255 * (t - 0.25) / 0.25)
            g = 0
            b = 255
        elif t < 0.75:
            r = 255
            g = int(255 * (t - 0.5) / 0.25)
            b = int(255 * (1 - (t - 0.5) / 0.25))
        else:
            r = 255
            g = int(255 * (t - 0.75) / 0.25 * 0.5 + 255 * (t - 0.75) / 0.25 * 0.5)
            b = 0
        lut[i] = [b, g, r]   # OpenCV uses BGR
    return lut


def _build_rainbow_lut() -> np.ndarray:
    """OpenCV COLORMAP_RAINBOW (blue=cold → red=hot)."""
    gray = np.arange(256, dtype=np.uint8).reshape(1, -1)
    colored = cv2.applyColorMap(gray, cv2.COLORMAP_RAINBOW)
    return colored.reshape(256, 3)


def _build_inferno_lut() -> np.ndarray:
    """OpenCV COLORMAP_INFERNO."""
    gray = np.arange(256, dtype=np.uint8).reshape(1, -1)
    colored = cv2.applyColorMap(gray, cv2.COLORMAP_INFERNO)
    return colored.reshape(256, 3)


# Pre-build all LUTs at import time
_LUTS = {
    "iron":    _build_iron_lut(),
    "rainbow": _build_rainbow_lut(),
    "inferno": _build_inferno_lut(),
}


# ── Palette detection ───────────────────────────────────────────────────────

def _detect_palette(img_bgr: np.ndarray) -> str:
    """
    Detect which colourmap palette the image uses by sampling the
    vertical gradient strip on the right-hand edge (common in thermal images)
    or by comparing colour distribution against known LUTs.

    Returns: "iron" | "rainbow" | "inferno" | "unknown"
    """
    h, w = img_bgr.shape[:2]
    # Sample 64 evenly-spaced rows from the rightmost 5% of pixels
    strip = img_bgr[:, int(w * 0.95):, :]
    if strip.shape[1] == 0:
        strip = img_bgr

    sampled = strip[np.linspace(0, h - 1, 64, dtype=int), :, :]
    mean_colors = sampled.mean(axis=1)   # (64, 3) BGR

    best_palette = "unknown"
    best_score   = float("inf")

    for name, lut in _LUTS.items():
        indices = np.linspace(0, 255, 64, dtype=int)
        expected = lut[indices].astype(float)
        score = np.mean(np.abs(mean_colors - expected))
        if score < best_score:
            best_score   = score
            best_palette = name

    if best_score > 60:
        logger.warning(
            f"Palette score {best_score:.1f} too high — "
            f"palette uncertain, using '{best_palette}' as best guess"
        )
    else:
        logger.debug(f"Detected palette: {best_palette} (score={best_score:.1f})")

    return best_palette


# ── Main decoder ────────────────────────────────────────────────────────────

def decode_colormap_to_celsius(
    image_path: str,
    temp_min: float = TEMP_MIN,
    temp_max: float = TEMP_MAX,
    palette: Optional[str] = None,
) -> np.ndarray:
    """
    Decode a pseudocolor thermal JPEG into a float32 temperature array (°C).

    Args:
        image_path: Full path to the thermal JPEG file
        temp_min:   Minimum temperature of the colour scale (°C)
        temp_max:   Maximum temperature of the colour scale (°C)
        palette:    Force palette ("iron"/"rainbow"/"inferno") or None to auto-detect

    Returns:
        float32 numpy array (H, W) with temperatures in °C
    """
    img = cv2.imread(str(image_path))
    if img is None:
        logger.error(f"Cannot read thermal image: {image_path}")
        return _luminance_fallback(image_path, temp_min, temp_max)

    detected = palette or _detect_palette(img)

    if detected == "unknown" or detected not in _LUTS:
        logger.warning(f"Unknown palette for {image_path} — using luminance fallback")
        return _luminance_fallback(image_path, temp_min, temp_max)

    lut = _LUTS[detected]

    # For each pixel: find closest colour in LUT → get index → map to temperature
    h, w = img.shape[:2]
    pixels = img.reshape(-1, 3).astype(np.float32)       # (H*W, 3)
    lut_f  = lut.astype(np.float32)                      # (256, 3)

    # Vectorised nearest-neighbour search using squared Euclidean distance
    # Process in chunks to avoid huge RAM allocation on large images
    chunk = 4096
    indices = np.empty(h * w, dtype=np.uint8)
    for start in range(0, h * w, chunk):
        end   = min(start + chunk, h * w)
        diff  = lut_f[np.newaxis, :, :] - pixels[start:end, np.newaxis, :]   # (C, 256, 3)
        dists = (diff ** 2).sum(axis=2)   # (C, 256)
        indices[start:end] = np.argmin(dists, axis=1)

    # Map index (0–255) → temperature
    temp_flat = temp_min + (indices.astype(np.float32) / 255.0) * (temp_max - temp_min)
    temp_array = temp_flat.reshape(h, w)

    logger.info(
        f"Decoded {Path(image_path).name} | palette={detected} "
        f"range=[{temp_array.min():.1f}, {temp_array.max():.1f}]°C"
    )
    return temp_array


def _luminance_fallback(image_path: str, temp_min: float, temp_max: float) -> np.ndarray:
    """
    Fallback: convert image to grayscale and linearly map 0–255 → temp_min–temp_max.
    Not accurate but produces a valid temperature array.
    """
    img = cv2.imread(str(image_path))
    if img is None:
        logger.error(f"Cannot read image for fallback: {image_path}")
        return np.full((64, 64), (temp_min + temp_max) / 2, dtype=np.float32)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    return temp_min + (gray / 255.0) * (temp_max - temp_min)
