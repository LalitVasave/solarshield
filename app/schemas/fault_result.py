from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal


class FaultResultOut(BaseModel):
    id: str
    inspection_id: str
    fault_detected: bool
    fault_type: Optional[str]
    severity: str
    confidence: Optional[Decimal]
    delta_t: Optional[Decimal]
    # Thermal detail
    hotspot_count: int
    max_temp: Optional[Decimal]
    median_temp: Optional[Decimal]
    # RGB detail
    detection_count: int
    annotated_image_path: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
