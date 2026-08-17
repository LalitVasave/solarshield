"""
Auth schemas — Phase 5
"""
from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    password: str


class UserOut(BaseModel):
    id: str
    username: str
    email: Optional[str]
    is_active: bool
    is_admin: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
