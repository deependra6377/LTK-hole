from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uuid
import cv2
import numpy as np
from ultralytics import YOLO
from utils.discount import calculate_discount

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend (ngrok / mobile)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in prod, restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model path (replace with your trained model if ready)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "hole_detector.pt")
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = "yolov8n.pt"  # fallback to YOLOv8 Nano pretrained
model = YOLO(MODEL_PATH)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Polygon definitions for calibration
FRAME_POLYGONS = {
    "briefs": {
        "width_mm": 200,
        "polygon_norm": [
            [0.1, 0.0], [0.9, 0.0], [1.0, 0.7], [0.0, 0.7]
        ]
    },
    "boxers": {
        "width_mm": 220,
        "polygon_norm": [
            [0.05, 0.0], [0.95, 0.0], [0.95, 0.9], [0.05, 0.9]
        ]
    }
}


@app.get("/")
async def root():
    return {"message": "Hole Detection API running"}


@app.post("/scan")
async def scan_innerwear(file: UploadFile, product_type: str = Form(...)):
    # Save upload
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())

    image = cv2.imread(filepath)
    if image is None:
        return JSONResponse({"error": "Invalid image"}, status_code=400)

    h, w = image.shape[:2]
    frame_meta = FRAME_POLYGONS.get(product_type.lower())
    if not frame_meta:
        return JSONResponse({"error": "Unknown product type"}, status_code=400)

    # Create polygon mask
    polygon_px = np.array([
        [int(x * w), int(y * h)] for x, y in frame_meta["polygon_norm"]
    ])
    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.fillPoly(mask, [polygon_px], 255)

    masked = cv2.bitwise_and(image, image, mask=mask)
    masked_path = filepath.replace(f".{ext}", "_masked.jpg")
    cv2.imwrite(masked_path, masked)

    # Run YOLO detection
    results = model.predict(masked_path)
    detections = results[0].boxes.xyxy.cpu().numpy()

    if len(detections) == 0:
        return JSONResponse({"message": "No hole detected", "discount": "0%"})

    # Get largest hole
    largest = max(detections, key=lambda b: (b[2]-b[0]) * (b[3]-b[1]))
    x1, y1, x2, y2 = largest
    hole_px_w = x2 - x1
    hole_px_h = y2 - y1

    mm_per_px = frame_meta["width_mm"] / w
    hole_w_mm = hole_px_w * mm_per_px
    hole_h_mm = hole_px_h * mm_per_px
    hole_area_mm2 = hole_w_mm * hole_h_mm

    discount = calculate_discount(hole_area_mm2)

    return JSONResponse({
    "hole_detected": True,
    "hole_area_mm2": float(round(hole_area_mm2, 2)),  # ensure Python float
    "discount": str(discount),                        # ensure string
    "file": str(filename),
    "polygon_used": [[int(x), int(y)] for x, y in polygon_px.tolist()]  # ensure ints
})
