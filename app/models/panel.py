from sqlalchemy import Column, String, Numeric, DateTime, func
from app.database import Base


class Panel(Base):
    __tablename__ = "panels"

    id           = Column(String(10), primary_key=True)   # e.g. "P-001"
    farm_id      = Column(String(36), nullable=False, index=True)
    lat          = Column(Numeric(10, 8), nullable=False)
    lng          = Column(Numeric(11, 8), nullable=False)
    row_num      = Column(String(5))
    col_num      = Column(String(5))
    installed_at = Column(DateTime, server_default=func.now())
    created_at   = Column(DateTime, server_default=func.now())
