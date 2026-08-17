"""
Celery application — Phase 5

Replaces FastAPI BackgroundTasks with a proper job queue.
Jobs persist in Redis — survive server/worker restarts.

Usage from API:
    from app.tasks.celery_app import run_pipeline_task
    run_pipeline_task.delay(inspection_id)
"""
from celery import Celery
from app.config import settings

celery_app = Celery(
    "solarshield",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.celery_app"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,          # re-queue on worker crash
    worker_prefetch_multiplier=1, # one task at a time per worker
)


@celery_app.task(name="run_pipeline", bind=True, max_retries=2)
def run_pipeline_task(self, inspection_id: str) -> None:
    """
    Celery task wrapper around the ML pipeline.
    Retries up to 2 times on unexpected failure.
    """
    try:
        from app.services.pipeline_service import run_pipeline
        run_pipeline(inspection_id)
    except Exception as exc:
        raise self.retry(exc=exc, countdown=30)
