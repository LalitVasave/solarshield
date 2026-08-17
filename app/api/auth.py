"""
Auth API — Phase 5

POST /auth/register  — create a new user account
POST /auth/token     — login, returns JWT access token
GET  /auth/me        — get current user info
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.database import get_db
from app.models.user import User
from app.schemas.auth import Token, UserCreate, UserOut
from app.auth.jwt_handler import create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _hash_password(password: str) -> str:
    return pwd_context.hash(password)


def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


@router.post("/register", response_model=UserOut, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    The first user is automatically made admin.
    """
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    is_first_user = db.query(User).count() == 0
    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=_hash_password(user_in.password),
        is_admin=is_first_user,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/token", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with username + password, returns JWT Bearer token.
    Use this token in the Authorization: Bearer <token> header.
    """
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not _verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    token = create_access_token(data={"sub": user.username})
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return current_user
