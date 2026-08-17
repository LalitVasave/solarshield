"""
Inspections API — Phase 5

Key change from Phase 4:
  background_tasks.add_task(run_pipeline, id)   ← OLD (lost on restart)
  run_pipeline_task.delay(id)                   ← NEW (Celery, persists in Redis)
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.inspection import Inspection
from app.models.panel import Panel
from app.models.user import User
from app.schemas.inspection import InspectionOut, InspectionWithResultOut
from app.storage import save_image
from app.tasks.celery_app import run_pipeline_task
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/inspections", tags=["inspections"])


@router.post("/", response_model=InspectionOut, status_code=201)
async def create_inspection(
    request: Request,
    panel_id: str = Form(...),
    rgb_image: UploadFile = File(...),
    thermal_image: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Submit a new inspection for a panel.
    Images are saved immediately. ML pipeline is queued in Celery (Redis).
    Poll GET /inspections/{id} to check status: pending → processing → completed.
    """
    panel = db.query(Panel).filter(Panel.id == panel_id).first()
    if not panel:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")

    rgb_path     = await save_image(rgb_image, "rgb")
    thermal_path = await save_image(thermal_image, "thermal")

    inspection = Inspection(
        panel_id=panel_id,
        status="pending",
        rgb_image_path=rgb_path,
        thermal_image_path=thermal_path
    )
    db.add(inspection)
    db.commit()
    db.refresh(inspection)

    # Enqueue ML pipeline in Celery — persists in Redis even if server restarts
    run_pipeline_task.delay(inspection.id)

    return inspection


@router.get("/", response_model=list[InspectionOut])
def list_inspections(
    panel_id: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """List inspections with optional filtering by panel_id or status. Returns latest 50."""
    q = db.query(Inspection)
    if panel_id:
        q = q.filter(Inspection.panel_id == panel_id)
    if status:
        q = q.filter(Inspection.status == status)
    return q.order_by(Inspection.inspected_at.desc()).limit(50).all()


@router.get("/{inspection_id}", response_model=InspectionWithResultOut)
def get_inspection(
    inspection_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Get a single inspection by ID, including fault result if available.
    Poll this endpoint to track ML pipeline completion.
    """
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return inspection
