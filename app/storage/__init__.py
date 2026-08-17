"""
Image storage helper — saves uploaded files to disk.
"""
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.config import settings


async def save_image(file: UploadFile, subfolder: str) -> str:
    """
    Save an uploaded image file to the storage directory.

    Args:
        file:      FastAPI UploadFile
        subfolder: "rgb" or "thermal"

    Returns:
        Relative path stored in DB (e.g. "rgb/uuid.jpg")
    """
    max_bytes = settings.max_image_size_mb * 1024 * 1024
    content   = await file.read()

    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Image too large. Max {settings.max_image_size_mb}MB"
        )

    suffix    = Path(file.filename).suffix or ".jpg"
    filename  = f"{uuid.uuid4()}{suffix}"
    dest_dir  = Path(settings.image_storage_path) / subfolder
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / filename

    with open(dest_path, "wb") as f:
        f.write(content)

    return f"{subfolder}/{filename}"
