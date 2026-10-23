# PlantSense AI - Custom Model Training (PlantVillage Dataset)

This directory provides the complete code to train your own custom **Deep Learning (CNN / MobileNetV2)** plant disease detection model using the **PlantVillage** dataset.

---

## 1. Dataset Download
Download the official **PlantVillage Dataset** from Kaggle:
👉 [Kaggle PlantVillage Dataset Link](https://www.kaggle.com/datasets/emmarex/plantdisease)

Extract the dataset into:
```
ml/PlantVillage/
  ├── Tomato___Bacterial_spot/
  ├── Tomato___Early_blight/
  ├── Tomato___Late_blight/
  ├── Tomato___healthy/
  ├── Potato___Early_blight/
  └── ... (38 disease/healthy classes)
```

---

## 2. Install Python Dependencies
```bash
cd ml
pip install -r requirements.txt
```

---

## 3. Train the Model
Run the transfer learning script (uses MobileNetV2 pre-trained on ImageNet):
```bash
python train_plantvillage_cnn.py
```
This will:
- Apply data augmentation (rotation, zooms, flips).
- Train for 15 epochs with early stopping.
- Export the trained weights to `plant_disease_mobilenetv2.keras`.
- Save class label mapping to `class_indices.json`.

---

## 4. Run the Prediction API
Start the FastAPI server:
```bash
uvicorn predict_api:app --reload --port 8000
```
Test prediction:
```bash
curl -X POST "http://localhost:8000/predict" -F "file=@sample_leaf.jpg"
```
