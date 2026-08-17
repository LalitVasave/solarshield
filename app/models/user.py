"""
User model — Phase 5 (JWT authentication)
"""
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id           = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username     = Column(String(64), unique=True, nullable=False, index=True)
    email        = Column(String(255), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active    = Column(Boolean, default=True)
    is_admin     = Column(Boolean, default=False)
    created_at   = Column(DateTime, server_default=func.now())
