"""
JWT handler — Phase 5

Creates and verifies signed JWT tokens.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from app.config import settings


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.jwt_expire_minutes)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> Optional[str]:
    """
    Decode and verify a JWT token.
    Returns the username (sub claim) or None if invalid.
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        username: str = payload.get("sub")
        return username
    except JWTError:
        return None
