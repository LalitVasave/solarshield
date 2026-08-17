from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.fault_result import FaultResultOut


class InspectionOut(BaseModel):
    id: str
    panel_id: str
    status: str
    rgb_image_path: Optional[str]
    thermal_image_path: Optional[str]
    inspected_at: datetime

    model_config = {"from_attributes": True}


class InspectionWithResultOut(InspectionOut):
    result: Optional[FaultResultOut] = None

    model_config = {"from_attributes": True}
