"""
Co-registration — Phase 3 (unchanged in Phase 5)
Aligns thermal array to RGB coordinate space.
In simulation mode this is an identity transform.
"""
import numpy as np
import cv2


def align_thermal_to_rgb(thermal: np.ndarray, target_shape: tuple) -> np.ndarray:
    """
    Resize thermal array to match RGB image dimensions.
    In simulation: identity (thermal already same size as RGB).
    In production with real FLIR: apply homography matrix calibrated per rig.
    """
    target_h, target_w = target_shape[0], target_shape[1]
    if thermal.shape == (target_h, target_w):
        return thermal
    resized = cv2.resize(thermal, (target_w, target_h), interpolation=cv2.INTER_LINEAR)
    return resized.astype(np.float32)
