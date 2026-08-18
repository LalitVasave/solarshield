"""
ML Pipeline Orchestrator — Phase 5 (unchanged logic, called by Celery)
"""
import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.inspection import Inspection
from app.models.fault_result import FaultResult
from app.services import rgb_service
from app.services import thermal_service
from app.services.fusion_service import fuse
from app.services.maintenance_service import create_jira_ticket

logger = logging.getLogger(__name__)


def run_pipeline(inspection_id: str) -> None:
    db: Session = SessionLocal()
    try:
        inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
        if not inspection:
            logger.error(f"Inspection {inspection_id} not found — pipeline aborted")
            return

        logger.info(f"Pipeline started | inspection={inspection_id} panel={inspection.panel_id}")
        inspection.status = "processing"
        db.commit()

        rgb_result = rgb_service.analyse(inspection.rgb_image_path)
        logger.info(
            f"RGB | fault={rgb_result.fault_type} conf={rgb_result.confidence} "
            f"detections={rgb_result.detection_count}"
        )

        thermal_result = thermal_service.analyse(
            inspection.thermal_image_path,
            inspection.rgb_image_path
        )
        logger.info(
            f"Thermal | severity={thermal_result.severity} delta_t={thermal_result.delta_t} "
            f"hotspots={thermal_result.hotspot_count} max={thermal_result.max_temp}°C"
        )

        fusion = fuse(rgb_result, thermal_result)
        logger.info(
            f"Fusion | detected={fusion.fault_detected} "
            f"type={fusion.fault_type} severity={fusion.severity}"
        )

        fault_result = FaultResult(
            inspection_id=inspection_id,
            fault_detected=fusion.fault_detected,
            fault_type=fusion.fault_type,
            severity=fusion.severity,
            confidence=fusion.confidence,
            delta_t=fusion.delta_t,
            hotspot_count=thermal_result.hotspot_count,
            max_temp=thermal_result.max_temp,
            median_temp=thermal_result.median_temp,
            detection_count=rgb_result.detection_count,
            annotated_image_path=rgb_result.annotated_image_path
        )
        db.add(fault_result)
        inspection.status = "completed"
        db.commit()
        logger.info(f"Pipeline completed | inspection={inspection_id}")

        # Trigger maintenance ticket if critical
        if fault_result.severity == "CRITICAL":
            logger.info(f"CRITICAL fault detected. Triggering maintenance webhook for panel {inspection.panel_id}.")
            create_jira_ticket(inspection.panel_id, fault_result)

    except Exception as e:
        logger.exception(f"Pipeline failed | inspection={inspection_id} error={e}")
        try:
            inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
            if inspection:
                inspection.status = "failed"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()
