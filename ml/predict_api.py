"""
PlantSense AI - Custom ML Model Inference Microservice (FastAPI)
Run with: uvicorn predict_api:app --host 0.0.0.0 --port 8000
"""

import io
import json
import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import tensorflow as tf

app = FastAPI(title="PlantSense Custom ML Predictor", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "plant_disease_mobilenetv2.keras"
CLASSES_PATH = "class_indices.json"

model = None
class_labels = {}

@app.on_event("startup")
def load_artifacts():
    global model, class_labels
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH)
        print(f"✅ Loaded ML Model from {MODEL_PATH}")
    else:
        print(f"⚠️ Warning: Model file {MODEL_PATH} not found. Train first using train_plantvillage_cnn.py")

    if os.path.exists(CLASSES_PATH):
        with open(CLASSES_PATH, "r") as f:
            indices = json.load(f)
            class_labels = {v: k for k, v in indices.items()}
        print(f"✅ Loaded {len(class_labels)} class labels")

@app.get("/")
def root():
    return {"status": "ok", "service": "PlantSense Custom Model API"}

@app.post("/predict")
async def predict_leaf(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please train or provide plant_disease_mobilenetv2.keras"
        )

    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize((224, 224))
        img_array = np.array(image, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array)[0]
        top_idx = int(np.argmax(predictions))
        confidence = float(predictions[top_idx]) * 100.0
        predicted_class = class_labels.get(top_idx, f"Class_{top_idx}")

        is_healthy = "healthy" in predicted_class.lower()

        return {
            "success": True,
            "prediction": {
                "class": predicted_class,
                "confidence": round(confidence, 2),
                "isHealthy": is_healthy
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
