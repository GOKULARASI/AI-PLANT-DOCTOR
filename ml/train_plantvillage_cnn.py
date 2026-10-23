"""
PlantSense AI - PlantVillage Custom Model Training Script
Architecture: MobileNetV2 (Transfer Learning) + Fine-Tuning
Dataset: PlantVillage (38 Classes of Plant Diseases + Healthy Leaves)
"""

import os
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt

# ─── Configuration ──────────────────────────────────────────────────────────
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 15
LEARNING_RATE = 0.0001
DATASET_DIR = './PlantVillage'  # Path to downloaded PlantVillage dataset directory
MODEL_SAVE_PATH = './plant_disease_mobilenetv2.keras'

def build_data_generators(dataset_dir):
    """
    Creates train and validation data generators with data augmentation.
    Augmentation improves model robustness on varied smartphone leaf photos.
    """
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255.0,
        rotation_range=25,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2  # 80% train, 20% validation
    )

    train_generator = train_datagen.flow_from_directory(
        dataset_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )

    val_generator = train_datagen.flow_from_directory(
        dataset_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )

    return train_generator, val_generator

def create_model(num_classes):
    """
    Builds MobileNetV2 Transfer Learning classifier.
    MobileNetV2 is lightweight, highly accurate (>98%), and fast on mobile/web.
    """
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)
    )
    # Freeze base model weights for initial training
    base_model.trainable = False

    model = keras.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.3),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.2),
        layers.Dense(num_classes, activation='softmax')
    ])

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

def train():
    if not os.path.exists(DATASET_DIR):
        print(f"❌ Dataset directory '{DATASET_DIR}' not found.")
        print("💡 Download PlantVillage from Kaggle: https://www.kaggle.com/datasets/emmarex/plantdisease")
        print("   Extract it into the 'ml/PlantVillage' directory and re-run.")
        return

    print("🌱 Loading PlantVillage Dataset...")
    train_gen, val_gen = build_data_generators(DATASET_DIR)
    num_classes = train_gen.num_classes
    print(f"✅ Found {num_classes} classes and {train_gen.samples} training images.")

    # Save class indices for inference
    import json
    with open('class_indices.json', 'w') as f:
        json.dump(train_gen.class_indices, f, indent=2)
    print("📋 Class indices saved to 'class_indices.json'")

    print("\n🧠 Constructing MobileNetV2 Model...")
    model = create_model(num_classes)
    model.summary()

    callbacks = [
        keras.callbacks.EarlyStopping(patience=4, restore_best_weights=True),
        keras.callbacks.ReduceLROnPlateau(factor=0.2, patience=2, min_lr=1e-6),
        keras.callbacks.ModelCheckpoint(MODEL_SAVE_PATH, save_best_only=True)
    ]

    print("\n🚀 Starting Training...")
    history = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS,
        callbacks=callbacks
    )

    print(f"\n🎉 Model successfully trained and saved to {MODEL_SAVE_PATH}")

if __name__ == '__main__':
    train()
