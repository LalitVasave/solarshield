"""
Reports API — Phase 6

GET /inspections/{id}/report  → streams a PDF inspection report
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.inspection import Inspection
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.services.report_service import generate_pdf
import io

router = APIRouter(prefix="/inspections", tags=["reports"])


@router.get("/{inspection_id}/report")
def download_report(
    inspection_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    """
    Generate and stream a PDF inspection report.
    Includes: inspection header, annotated RGB image,
    thermal metrics, fault classification, and recommendation.
    """
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    if inspection.status != "completed":
        raise HTTPException(status_code=400, detail=f"Inspection is not completed (status: {inspection.status})")
    if not inspection.result:
        raise HTTPException(status_code=404, detail="No fault result found for this inspection")

    pdf_bytes = generate_pdf(inspection)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=report_{inspection_id[:8]}.pdf"
        }
    )
