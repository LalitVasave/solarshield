import cv2
import time
import logging
from app.vision.yolo_model import predict, YOLOResult
from app.vision.annotator import annotate_frame

logger = logging.getLogger(__name__)

def generate_mjpeg_stream(stream_url: str):
    """
    Reads an RTSP stream (or video file), processes ML at 1 FPS,
    and yields an MJPEG multipart stream with bounding boxes.
    """
    cap = cv2.VideoCapture(stream_url)
    if not cap.isOpened():
        logger.error(f"Failed to open video stream: {stream_url}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0:
        fps = 30.0

    frame_interval = max(int(fps), 1)  # process 1 frame per second
    frame_count = 0
    last_result = YOLOResult()

    logger.info(f"Started video stream for {stream_url} at {fps} FPS")

    while True:
        success, frame = cap.read()
        if not success:
            logger.info("Video stream ended or disconnected.")
            break

        # ML inference at 1 FPS
        if frame_count % frame_interval == 0:
            last_result = predict(frame)
        
        # Annotate current frame with the last known result
        # (This prevents bounding boxes from flickering)
        annotated_frame = annotate_frame(frame, last_result)

        # Compress to JPEG
        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        if not ret:
            continue

        frame_bytes = buffer.tobytes()

        # Yield MJPEG format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

        frame_count += 1
        
        # If reading a local test video file, sleep to simulate real-time playback
        if stream_url.endswith('.mp4'):
            time.sleep(1.0 / fps)

    cap.release()
