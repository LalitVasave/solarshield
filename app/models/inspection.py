import uuid
from sqlalchemy import Column, String, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Inspection(Base):
    __tablename__ = "inspections"

    id                 = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    panel_id           = Column(String(10), ForeignKey("panels.id"), nullable=False, index=True)
    status             = Column(String(20), default="pending")  # pending | processing | completed | failed
    rgb_image_path     = Column(String(512))
    thermal_image_path = Column(String(512))
    inspected_at       = Column(DateTime, server_default=func.now())
    updated_at         = Column(DateTime, server_default=func.now(), onupdate=func.now())

    panel  = relationship("Panel", backref="inspections")
    result = relationship("FaultResult", back_populates="inspection", uselist=False)
