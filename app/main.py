"""
SolarShield — FastAPI Application
Phase 5: rate limiting, JWT auth, Celery job queue
Phase 6: static dashboard served at /dashboard
"""
from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.database import engine, Base
from app.api import panels, inspections, farms, reports, streams
from app.api import auth as auth_router
from app.config import settings
import app.models  # registers all ORM models before create_all
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)

# Rate limiter (slowapi)
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all DB tables on startup
    Base.metadata.create_all(bind=engine)
    # Ensure image directories exist
    for sub in ["rgb", "thermal", "annotated"]:
        os.makedirs(os.path.join(settings.image_storage_path, sub), exist_ok=True)
    os.makedirs("reports", exist_ok=True)
    os.makedirs("models", exist_ok=True)
    yield


app = FastAPI(
    title="SolarShield",
    description="AI-powered drone-based solar panel fault detection & inspection API",
    version="0.5.0",
    lifespan=lifespan
)

# ── Middleware ──────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth_router.router)
app.include_router(panels.router)
app.include_router(inspections.router)
app.include_router(farms.router)
app.include_router(reports.router)
app.include_router(streams.router)

# ── Phase 6: Dashboard (static files) ───────────────────────────────────────
dashboard_path = os.path.join(os.path.dirname(__file__), "..", "dashboard")
if os.path.isdir(dashboard_path):
    app.mount("/dashboard", StaticFiles(directory=dashboard_path, html=True), name="dashboard")

# ── Serve uploaded images ────────────────────────────────────────────────────
os.makedirs(settings.image_storage_path, exist_ok=True)
app.mount("/images", StaticFiles(directory=settings.image_storage_path), name="images")

# ── Serve 3D Digital Twin Models (Phase 9) ──────────────────────────────────
models_path = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(models_path, exist_ok=True)
app.mount("/models", StaticFiles(directory=models_path), name="models")


@app.get("/health", tags=["system"])
def health():
    return {"status": "ok", "app": settings.app_name, "version": "0.5.0"}
