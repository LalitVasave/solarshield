"""
Farms API — Phase 5

N+1 query fix: replaced per-panel loop with a single joined query.
Returns GPS coordinates + health colour for the dashboard map.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from sqlalchemy.orm import Session
import shutil
import os
from sqlalchemy import desc
from pydantic import BaseModel
from decimal import Decimal
from typing import Optional
from app.database import get_db
from app.models.panel import Panel
from app.models.inspection import Inspection
from app.models.fault_result import FaultResult
from app.models.user import User
from app.models.farm import Farm
from app.auth.dependencies import get_current_user
from app.services.flight_service import generate_kml_flightpath

router = APIRouter(prefix="/farms", tags=["farms"])

SEVERITY_COLOUR = {
    "NONE":   "green",
    "LOW":    "yellow",
    "MEDIUM": "yellow",
    "HIGH":   "red",
}


class FarmOut(BaseModel):
    id: str
    name: str
    location: Optional[str]
    digital_twin_url: Optional[str]

    model_config = {"from_attributes": True}


class PanelStatusOut(BaseModel):
    panel_id: str
    lat: Decimal
    lng: Decimal
    colour: str
    severity: str
    fault_type: Optional[str]
    last_inspected: Optional[str]

    model_config = {"from_attributes": True}


@router.get("/{farm_id}/panels/status", response_model=list[PanelStatusOut])
def farm_panel_status(
    farm_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Returns health status for every panel in the farm.
    Single optimised query (no N+1). Used by the dashboard map.
    """
    panels = db.query(Panel).filter(Panel.farm_id == farm_id).all()
    if not panels:
        raise HTTPException(status_code=404, detail=f"Farm {farm_id} not found")

    panel_ids = [p.id for p in panels]

    # Single query: latest completed inspection per panel using a subquery
    from sqlalchemy import func
    latest_subq = (
        db.query(
            Inspection.panel_id,
            func.max(Inspection.inspected_at).label("max_dt")
        )
        .filter(
            Inspection.panel_id.in_(panel_ids),
            Inspection.status == "completed"
        )
        .group_by(Inspection.panel_id)
        .subquery()
    )

    # Join to get actual inspection rows + fault results
    latest_rows = (
        db.query(Inspection, FaultResult)
        .join(latest_subq, (Inspection.panel_id == latest_subq.c.panel_id) &
              (Inspection.inspected_at == latest_subq.c.max_dt))
        .outerjoin(FaultResult, FaultResult.inspection_id == Inspection.id)
        .all()
    )

    # Build lookup: panel_id → (severity, fault_type, last_inspected)
    lookup = {}
    for insp, fault in latest_rows:
        lookup[insp.panel_id] = {
            "severity": fault.severity if fault else "NONE",
            "fault_type": fault.fault_type if fault else None,
            "last_inspected": insp.inspected_at.isoformat() if insp else None,
        }

    results = []
    for panel in panels:
        info = lookup.get(panel.id, {"severity": "NONE", "fault_type": None, "last_inspected": None})
        results.append(PanelStatusOut(
            panel_id=panel.id,
            lat=panel.lat,
            lng=panel.lng,
            colour=SEVERITY_COLOUR.get(info["severity"], "green"),
            severity=info["severity"],
            fault_type=info["fault_type"],
            last_inspected=info["last_inspected"],
        ))

    return results

@router.get("/{farm_id}/flightpath")
def download_flightpath(
    farm_id: str,
    altitude: int = 20,
    _: User = Depends(get_current_user)
):
    """
    Generate and download a KML flight path for the drone based on the farm's panel grid.
    """
    kml = generate_kml_flightpath(farm_id, altitude)
    if not kml:
        raise HTTPException(status_code=404, detail=f"No panels found for farm {farm_id}")
    
    return Response(
        content=kml, 
        media_type="application/vnd.google-earth.kml+xml", 
        headers={"Content-Disposition": f"attachment; filename={farm_id}_flightpath.kml"}
    )

@router.get("/{farm_id}", response_model=FarmOut)
def get_farm(farm_id: str, db: Session = Depends(get_db)):
    """Get farm details including the digital twin URL"""
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail=f"Farm {farm_id} not found")
    return farm

@router.post("/{farm_id}/3d-model")
def upload_3d_model(
    farm_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """Upload a .glb or .gltf 3D model for the farm."""
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail=f"Farm {farm_id} not found")
        
    models_dir = os.path.join(os.path.dirname(__file__), "..", "..", "models", farm_id)
    os.makedirs(models_dir, exist_ok=True)
    
    file_path = os.path.join(models_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    farm.digital_twin_url = f"/models/{farm_id}/{file.filename}"
    db.commit()
    
    return {"message": "3D model uploaded successfully", "digital_twin_url": farm.digital_twin_url}
