import uuid
from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import StreamingResponse
from app.services.stream_service import generate_mjpeg_stream

router = APIRouter(prefix="/streams", tags=["streams"])

# In-memory mapping of stream_id -> URL
STREAMS = {}

@router.post("/start")
async def start_stream(rtsp_url: str = Form(...)):
    """
    Register a new stream and return its feed URL.
    """
    stream_id = str(uuid.uuid4())
    STREAMS[stream_id] = rtsp_url
    return {
        "stream_id": stream_id, 
        "status": "started", 
        "feed_url": f"/streams/{stream_id}/feed"
    }

@router.get("/{stream_id}/feed")
def video_feed(stream_id: str):
    """
    MJPEG streaming endpoint for the dashboard.
    """
    if stream_id not in STREAMS:
        raise HTTPException(status_code=404, detail="Stream not found")
    
    url = STREAMS[stream_id]
    return StreamingResponse(
        generate_mjpeg_stream(url),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )
