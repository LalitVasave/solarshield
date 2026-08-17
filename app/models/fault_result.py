import uuid
from sqlalchemy import Column, String, Boolean, Numeric, Integer, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class FaultResult(Base):
    __tablename__ = "fault_results"

    id                   = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    inspection_id        = Column(String(36), ForeignKey("inspections.id"), nullable=False, index=True)
    fault_detected       = Column(Boolean, default=False)
    fault_type           = Column(String(64))
    severity             = Column(String(10), default="NONE")
    confidence           = Column(Numeric(4, 3))
    delta_t              = Column(Numeric(5, 2))
    # Thermal detail (Phase 3)
    hotspot_count        = Column(Integer, default=0)
    max_temp             = Column(Numeric(5, 2))
    median_temp          = Column(Numeric(5, 2))
    # RGB detail (Phase 4)
    detection_count      = Column(Integer, default=0)
    annotated_image_path = Column(String(512))
    created_at           = Column(DateTime, server_default=func.now())

    inspection = relationship("Inspection", back_populates="result")
