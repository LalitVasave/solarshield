"""
Drone Simulator — submits fake inspections for all panels.
Requires JWT token (get one with POST /auth/token first).

Usage:
    python scripts/simulate_drone.py --token <jwt_token>
    python scripts/simulate_drone.py --token <jwt_token> --panels 5
    python scripts/simulate_drone.py --token <jwt_token> --url http://localhost:8000
"""
import sys
import os
import argparse
import random
import time
import httpx
from pathlib import Path
import numpy as np
import cv2

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

parser = argparse.ArgumentParser(description="Drone inspection simulator")
parser.add_argument("--url",    default="http://localhost:8000")
parser.add_argument("--panels", type=int, default=40, help="Number of panels to simulate")
parser.add_argument("--token",  required=True, help="JWT Bearer token from POST /auth/token")
args = parser.parse_args()

BASE_URL = args.url
HEADERS  = {"Authorization": f"Bearer {args.token}"}


def _make_fake_rgb() -> bytes:
    """Generate a synthetic solar panel RGB image."""
    img = np.ones((480, 640, 3), dtype=np.uint8) * 40
    # Panel area (dark blue)
    img[50:430, 50:590] = [80, 60, 30]
    # Grid lines
    for x in range(50, 590, 90):
        cv2.line(img, (x, 50), (x, 430), (20, 20, 20), 2)
    for y in range(50, 430, 95):
        cv2.line(img, (50, y), (590, y), (20, 20, 20), 2)
    # Random dirt patches (50% chance)
    if random.random() < 0.5:
        cx, cy = random.randint(100, 540), random.randint(80, 400)
        cv2.ellipse(img, (cx, cy), (random.randint(20, 60), random.randint(10, 30)),
                    random.randint(0, 180), 0, 360, (15, 10, 5), -1)
    _, buf = cv2.imencode(".jpg", img)
    return buf.tobytes()


def _make_fake_thermal() -> bytes:
    """Generate a fake thermal colourmap image (iron palette simulation)."""
    h, w = 240, 320
    base = np.random.normal(42.0, 2.0, (h, w)).astype(np.float32)
    if random.random() < 0.6:
        cx, cy = random.randint(40, w-40), random.randint(40, h-40)
        y, x = np.ogrid[:h, :w]
        dist = (x-cx)**2 + (y-cy)**2
        base += 20.0 * np.exp(-dist / (2 * 20**2))
    # Map to iron colourmap
    norm = ((base - base.min()) / (base.max() - base.min() + 1e-6) * 255).astype(np.uint8)
    coloured = cv2.applyColorMap(norm, cv2.COLORMAP_HOT)
    _, buf = cv2.imencode(".jpg", coloured)
    return buf.tobytes()


def submit_inspection(panel_id: str) -> dict | None:
    rgb_bytes     = _make_fake_rgb()
    thermal_bytes = _make_fake_thermal()

    files = {
        "rgb_image":     ("rgb.jpg",     rgb_bytes,     "image/jpeg"),
        "thermal_image": ("thermal.jpg", thermal_bytes, "image/jpeg"),
    }
    data = {"panel_id": panel_id}

    try:
        r = httpx.post(f"{BASE_URL}/inspections/", data=data, files=files, headers=HEADERS, timeout=30)
        if r.status_code == 201:
            return r.json()
        else:
            print(f"  ✗ {panel_id}: HTTP {r.status_code} — {r.text[:100]}")
            return None
    except Exception as e:
        print(f"  ✗ {panel_id}: {e}")
        return None


def main():
    print(f"🚁 SolarShield Drone Simulator")
    print(f"   Target: {BASE_URL}")
    print(f"   Panels: {args.panels}")
    print()

    # Get panel list
    try:
        r = httpx.get(f"{BASE_URL}/panels/", headers=HEADERS, timeout=10)
        r.raise_for_status()
        all_panels = r.json()
    except Exception as e:
        print(f"✗ Failed to fetch panel list: {e}")
        print("  Make sure the API is running and the token is valid.")
        sys.exit(1)

    panels = all_panels[:args.panels]
    print(f"📋 Found {len(all_panels)} panels, simulating {len(panels)}")
    print()

    submitted = 0
    for panel in panels:
        pid = panel["id"]
        result = submit_inspection(pid)
        if result:
            submitted += 1
            print(f"  ✓ {pid} → inspection {result['id'][:8]}… queued")
        time.sleep(0.3)  # don't hammer the API

    print()
    print(f"✅ Done: {submitted}/{len(panels)} inspections submitted")
    print(f"   Monitor: GET {BASE_URL}/inspections/")


if __name__ == "__main__":
    main()
