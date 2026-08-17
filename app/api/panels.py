"""
Panels API — Phase 5 (JWT protected)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from decimal import Decimal
from app.database import get_db
from app.models.panel import Panel
from app.models.user import User
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/panels", tags=["panels"])


class PanelOut(BaseModel):
    id: str
    farm_id: str
    lat: Decimal
    lng: Decimal
    row_num: str | None
    col_num: str | None

    model_config = {"from_attributes": True}


@router.get("/", response_model=list[PanelOut])
def list_panels(
    farm_id: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """List all panels, optionally filtered by farm_id."""
    q = db.query(Panel)
    if farm_id:
        q = q.filter(Panel.farm_id == farm_id)
    return q.order_by(Panel.id).all()


@router.get("/{panel_id}", response_model=PanelOut)
def get_panel(
    panel_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Get a single panel by ID."""
    panel = db.query(Panel).filter(Panel.id == panel_id).first()
    if not panel:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")
    return panel


@router.get("/{panel_id}/history")
def panel_history(
    panel_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Return all inspections for a panel (latest first)."""
    from app.models.inspection import Inspection
    from app.schemas.inspection import InspectionWithResultOut
    panel = db.query(Panel).filter(Panel.id == panel_id).first()
    if not panel:
        raise HTTPException(status_code=404, detail=f"Panel {panel_id} not found")
    inspections = (
        db.query(Inspection)
        .filter(Inspection.panel_id == panel_id)
        .order_by(Inspection.inspected_at.desc())
        .limit(100)
        .all()
    )
    return [InspectionWithResultOut.model_validate(i) for i in inspections]
