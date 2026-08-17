"""
Seed Farm — creates 40 solar panels in a 5×8 grid for FARM-001.
Run once after starting the database.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models.panel import Panel
import app.models  # ensure all models registered

Base.metadata.create_all(bind=engine)

FARM_ID  = "FARM-001"
BASE_LAT = 28.6139   # Delhi area (change to your real farm GPS)
BASE_LNG = 77.2090
SPACING  = 0.0001    # ~11m between panels

db = SessionLocal()
try:
    if db.query(Panel).filter(Panel.farm_id == FARM_ID).count() > 0:
        print(f"Farm {FARM_ID} already seeded. Skipping.")
    else:
        panels = []
        for row in range(5):
            for col in range(8):
                panel_num = row * 8 + col + 1
                panel = Panel(
                    id=f"P-{panel_num:03d}",
                    farm_id=FARM_ID,
                    lat=BASE_LAT + row * SPACING,
                    lng=BASE_LNG + col * SPACING,
                    row_num=str(row + 1),
                    col_num=str(col + 1),
                )
                panels.append(panel)

        db.bulk_save_objects(panels)
        db.commit()
        print(f"✅ Seeded {len(panels)} panels for {FARM_ID}")
finally:
    db.close()
