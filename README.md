# SolarShield

AI-powered drone-based solar panel fault detection & inspection API.
Phases 1–6 complete — from API skeleton to live dashboard with PDF reports.

## Features

| Feature | Phase |
|---------|-------|
| FastAPI REST API | 1 |
| 40-panel farm seeded with GPS coordinates | 1 |
| YOLOv8 RGB fault detection (dirt/crack/shadow/obstruction) | 4 |
| Real OpenCV thermal hotspot detection | 3 |
| Thermal colormap JPEG decoder (your real drone images) | 5 |
| Multimodal fusion engine | 2 |
| **Celery job queue (jobs survive server restarts)** | 5 |
| **JWT authentication** | 5 |
| **Rate limiting** | 5 |
| **Live web dashboard (Leaflet farm map)** | 6 |
| **PDF inspection reports** | 6 |

---

## Quick Start

### 1. Start Docker services (MySQL + Redis)
```powershell
docker compose up -d mysql redis
# Wait ~15 seconds
```

### 2. Create virtual environment & install
```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Seed database
```powershell
python scripts/seed_farm.py    # creates 40 panels
python scripts/seed_admin.py   # creates admin user (admin / solarshield2024!)
```

### 4. Start API
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Start Celery worker (new terminal, venv active)
```powershell
celery -A app.tasks.celery_app worker --loglevel=info --pool=solo
```

### 6. Open Dashboard
```
http://localhost:8000/dashboard/
```
Login with `admin` / `solarshield2024!`

### 7. Open Swagger UI
```
http://localhost:8000/docs
```

---

## API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/health` | ❌ | Health check |
| POST | `/auth/register` | ❌ | Create user |
| POST | `/auth/token` | ❌ | Login → JWT token |
| GET | `/auth/me` | ✅ | Current user |
| GET | `/panels/` | ✅ | List all panels |
| GET | `/panels/{id}` | ✅ | Get one panel |
| GET | `/panels/{id}/history` | ✅ | Panel inspection history |
| POST | `/inspections/` | ✅ | Submit inspection (Celery queued) |
| GET | `/inspections/` | ✅ | List inspections |
| GET | `/inspections/{id}` | ✅ | Get inspection + fault result |
| GET | `/inspections/{id}/report` | ✅ | Download PDF report |
| GET | `/farms/{farm_id}/panels/status` | ✅ | Farm map status |

---

## Simulate a drone flight

```powershell
# 1. Get a token
$token = (Invoke-WebRequest -Uri http://localhost:8000/auth/token `
  -Method POST -Body "username=admin&password=solarshield2024!" `
  -ContentType "application/x-www-form-urlencoded" | ConvertFrom-Json).access_token

# 2. Run simulator
python scripts/simulate_drone.py --token $token --panels 10
```

---

## Project Structure

```
solarshield/
├── app/
│   ├── main.py              FastAPI app + rate limiting + CORS
│   ├── config.py            Settings from .env
│   ├── database.py          SQLAlchemy engine
│   ├── api/                 Route handlers
│   │   ├── auth.py          POST /auth/register, /auth/token
│   │   ├── panels.py        GET /panels/
│   │   ├── inspections.py   POST/GET /inspections/ (Celery)
│   │   ├── farms.py         GET /farms/{id}/panels/status
│   │   └── reports.py       GET /inspections/{id}/report (PDF)
│   ├── auth/                JWT handler + FastAPI dependencies
│   ├── models/              ORM: Panel, Inspection, FaultResult, User
│   ├── schemas/             Pydantic schemas
│   ├── services/            ML services
│   │   ├── pipeline_service.py   Orchestrator
│   │   ├── rgb_service.py        YOLOv8 inference
│   │   ├── thermal_service.py    OpenCV + colormap decode
│   │   ├── fusion_service.py     Multimodal decision
│   │   └── report_service.py     PDF generation (ReportLab)
│   ├── tasks/
│   │   └── celery_app.py    Celery app + pipeline task
│   ├── vision/
│   │   ├── yolo_model.py         YOLOv8 wrapper
│   │   ├── annotator.py          Bounding box drawing
│   │   ├── colormap_decoder.py   JPEG thermal → temperature array ← NEW
│   │   ├── thermal_generator.py  Synthetic thermal (sim mode)
│   │   └── coregistration.py     Thermal-RGB alignment
│   └── storage/             Image upload/save
├── dashboard/               Phase 6 web dashboard
│   ├── index.html           Farm map + inspections table
│   ├── css/style.css
│   └── js/
│       ├── map.js           Leaflet panel markers
│       └── dashboard.js     Auth, API, drawer
├── scripts/
│   ├── seed_farm.py         40 panels → DB
│   ├── seed_admin.py        Admin user
│   └── simulate_drone.py    Fake inspections (JWT-authenticated)
├── models/                  .pt weights (gitignored)
├── docker-compose.yml       MySQL + Redis + API + Celery worker
└── requirements.txt
```

---

## Training YOLOv8 on your dataset

1. Annotate your images on [Roboflow](https://roboflow.com) (Object Detection project)
2. Export in YOLOv8 format → get API download link
3. Open `notebooks/train_yolov8.ipynb` in Google Colab
4. Run all cells with your Roboflow link
5. Download `best.pt` → copy to `models/yolov8_solar.pt`
6. Restart the Celery worker — it will load the fine-tuned model automatically

---

## Thermal image support

Your drone thermal JPEGs (iron/rainbow/inferno colormap) are automatically decoded
to temperature arrays by `app/vision/colormap_decoder.py`.

To adjust the temperature range (default 20–80°C):
```python
# In app/vision/colormap_decoder.py
TEMP_MIN = 20.0
TEMP_MAX = 80.0
```
