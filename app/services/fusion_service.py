"""
Multimodal Fault Fusion Engine — Phase 4 (unchanged in Phase 5)
Combines RGB + thermal into a single fault decision.
"""
from dataclasses import dataclass
from app.services.rgb_service import RGBResult
from app.services.thermal_service import ThermalResult


@dataclass
class FusionResult:
    fault_detected: bool
    fault_type: str | None
    severity: str
    confidence: float
    delta_t: float


def fuse(rgb: RGBResult, thermal: ThermalResult) -> FusionResult:
    """
    Case 1: RGB high + Thermal MEDIUM/HIGH  → confirmed fault
    Case 2: RGB low  + Thermal HIGH         → electrical/thermal-only fault
    Case 3: RGB high + Thermal NONE/LOW     → surface/cosmetic fault
    Case 4: Everything else                 → no fault
    """
    rgb_conf      = rgb.confidence
    thermal_sev   = thermal.severity
    has_rgb_fault = rgb.fault_type is not None

    if has_rgb_fault and rgb_conf > 0.70 and thermal_sev in ("MEDIUM", "HIGH"):
        return FusionResult(True, rgb.fault_type, thermal_sev, rgb_conf, thermal.delta_t)

    if thermal_sev == "HIGH" and rgb_conf < 0.50:
        return FusionResult(True, "thermal-only", "MEDIUM", 0.60, thermal.delta_t)

    if has_rgb_fault and rgb_conf > 0.70 and thermal_sev in ("NONE", "LOW"):
        return FusionResult(True, rgb.fault_type, "LOW", rgb_conf, thermal.delta_t)

    return FusionResult(False, None, "NONE", rgb_conf, thermal.delta_t)
