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

# Updated polygon definitions with actual coordinates
FRAME_POLYGONS = {
    "briefs": {
        "width_mm": 419,
        "polygon_norm": [
            [0.4854, 0.9571],
            [0.6154, 0.9429],
            [0.8488, 0.6143],
            [0.9788, 0.4036],
            [0.9523, 0.0393],
            [0.0477, 0.0464],
            [0.0265, 0.4143],
            [0.2228, 0.7143],
            [0.3979, 0.9429]
        ],
    },
    "boxers": {
        "width_mm": 461,
        "polygon_norm": [
            [0.4026, 0.9934],
            [0.4179, 0.9901],
            [0.4385, 0.9172],
            [0.4692, 0.8874],
            [0.5154, 0.9007],
            [0.5462, 0.9901],
            [0.559, 0.9967],
            [0.7872, 0.9073],
            [0.9462, 0.8179],
            [0.9385, 0.7053],
            [0.8487, 0.202],
            [0.8436, 0.0728],
            [0.1179, 0.0728],
            [0.1179, 0.1755],
            [0.0205, 0.7649],
            [0.0231, 0.8179],
            [0.1359, 0.8907],
            [0.3103, 0.9702]
        ],
    },
    "tshirt": {
        "width_mm": 432,
        "polygon_norm": [
            [0.0071, 0.3532],
            [0.0283, 0.4683],
            [0.0353, 0.9623],
            [0.2544, 0.9821],
            [0.5265, 0.994],
            [0.7597, 0.994],
            [0.9117, 0.9762],
            [0.947, 0.9583],
            [0.9364, 0.5933],
            [0.9611, 0.5238],
            [0.9788, 0.3552],
            [0.9081, 0.3135],
            [0.8657, 0.2143],
            [0.894, 0.0357],
            [0.8693, 0.0258],
            [0.735, 0.0099],
            [0.6466, 0.0476],
            [0.5442, 0.0655],
            [0.4806, 0.0655],
            [0.4205, 0.0635],
            [0.3428, 0.0476],
            [0.2474, 0.0099],
            [0.0883, 0.0337],
            [0.106, 0.1429],
            [0.1025, 0.256],
            [0.0601, 0.3274]
        ],
    },
    "tank": {
        "width_mm": 356,
        "polygon_norm": [
            [0.1962, 0.439],
            [0.2098, 0.4671],
            [0.2016, 0.5986],
            [0.2098, 0.9507],
            [0.3488, 0.9718],
            [0.5995, 0.9742],
            [0.7847, 0.9484],
            [0.7875, 0.5634],
            [0.7793, 0.4656],
            [0.8256, 0.4343],
            [0.8583, 0.4343],
            [0.9101, 0.4178],
            [0.9809, 0.3803],
            [0.8474, 0.1103],
            [0.6594, 0.0235],
            [0.6431, 0.0258],
            [0.5967, 0.061],
            [0.5395, 0.0775],
            [0.4768, 0.0775],
            [0.3678, 0.0446],
            [0.3352, 0.0235],
            [0.297, 0.0329],
            [0.1444, 0.1103],
            [0.0218, 0.3451],
            [0.0109, 0.3779],
            [0.0272, 0.392],
            [0.139, 0.4343]
        ],
    },
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