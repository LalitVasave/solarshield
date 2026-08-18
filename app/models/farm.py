from sqlalchemy import Column, String, DateTime, func
from app.database import Base

class Farm(Base):
    __tablename__ = "farms"

    id = Column(String(36), primary_key=True)  # e.g., "FARM-001"
    name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=True)
    digital_twin_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
