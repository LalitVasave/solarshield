"""
Farms API — Phase 5

N+1 query fix: replaced per-panel loop with a single joined query.
Returns GPS coordinates + health colour for the dashboard map.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from decimal import Decimal
from typing import Optional
from app.database import get_db
from app.models.panel import Panel
from app.models.inspection import Inspection
from app.models.fault_result import FaultResult
from app.models.user import User
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/farms", tags=["farms"])

SEVERITY_COLOUR = {
    "NONE":   "green",
    "LOW":    "yellow",
    "MEDIUM": "yellow",
    "HIGH":   "red",
}


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
