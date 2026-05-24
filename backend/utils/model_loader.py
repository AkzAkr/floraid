import glob
import json
import os
import tempfile
import zipfile
from typing import Tuple

import numpy as np
import tensorflow as tf

keras = tf.keras
layers = tf.keras.layers

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")
DEFAULT_CLASS_INDICES_PATH = os.path.join(MODEL_DIR, "class_indices.json")


# ============================================================================
# CUSTOM LAYERS - MUST be defined BEFORE load_model() is called
# ============================================================================

@keras.utils.register_keras_serializable(package="FloraID")
class AugmentationLayer(layers.Layer):
    """Inference-safe placeholder for the training-time augmentation layer."""

    def call(self, inputs, training=False):
        return inputs


@keras.utils.register_keras_serializable(package="Custom")  # package="Custom" sesuai model tersimpan
class EfficientNetPreprocess(layers.Layer):
    """
    Serializable replacement for Lambda preprocessing layer.
    Nama HARUS sama persis dengan yang di model: 'EfficientNetPreprocess'
    """

    def call(self, inputs, **kwargs):
        return keras.applications.efficientnet.preprocess_input(inputs)

    def get_config(self):
        return super().get_config()


# Alias untuk backward compatibility (jika ada kode lain pakai nama lama)
EfficientNetPreprocessLayer = EfficientNetPreprocess


def get_custom_objects():
    return {
        "AugmentationLayer": AugmentationLayer,
        "EfficientNetPreprocess": EfficientNetPreprocess,
        "EfficientNetPreprocessLayer": EfficientNetPreprocessLayer,  # Alias
        "RandomRotation": layers.RandomRotation,
        "RandomFlip": layers.RandomFlip,
        "RandomZoom": layers.RandomZoom,
        "RandomBrightness": layers.RandomBrightness,
        "RandomContrast": layers.RandomContrast,
        "RandomTranslation": layers.RandomTranslation,
    }


def find_model():
    """Find the preferred .keras model file in backend/models."""
    if not os.path.exists(MODEL_DIR):
        return None

    files = glob.glob(os.path.join(MODEL_DIR, "*.keras"))
    if not files:
        return None

    files.sort(
        key=lambda path: (
            "CLEAN" not in os.path.basename(path).upper(),
            -os.path.getsize(path),
        )
    )
    return files[0]


def _resolve_model_path(model_path: str | None) -> str:
    """Resolve configured model path and fall back to an available local model."""
    if model_path:
        candidate = model_path
        if not os.path.isabs(candidate):
            candidate = os.path.join(BASE_DIR, candidate)
        candidate = os.path.abspath(candidate)

        if os.path.exists(candidate):
            return candidate

        fallback = find_model()
        if fallback:
            print(f"Warning: Configured MODEL_PATH not found: {candidate}")
            print(f"Warning: Falling back to: {fallback}")
            return os.path.abspath(fallback)

        return candidate

    fallback = find_model()
    if fallback:
        return os.path.abspath(fallback)

    return os.path.join(MODEL_DIR, "efficientnetb0_flowers102_clean.keras")


def _resolve_backend_path(path: str) -> str:
    """Resolve relative backend paths consistently from the backend directory."""
    if os.path.isabs(path):
        return os.path.abspath(path)
    return os.path.abspath(os.path.join(BASE_DIR, path))


def _create_safe_model_archive(model_path: str) -> str:
    """Create a temporary .keras archive without unsafe notebook Lambda bytecode."""
    with zipfile.ZipFile(model_path, "r") as source:
        config = json.loads(source.read("config.json"))

        for layer in config.get("config", {}).get("layers", []):
            # Fix Lambda layer dari notebook training
            if layer.get("class_name") == "Lambda" and layer.get("name") == "efficientnet_preprocess":
                layer["module"] = None
                layer["class_name"] = "EfficientNetPreprocess"
                layer["registered_name"] = "Custom>EfficientNetPreprocess"
                layer["config"] = {
                    "name": layer.get("name", "efficientnet_preprocess"),
                    "trainable": layer.get("config", {}).get("trainable", True),
                    "dtype": layer.get("config", {}).get("dtype"),
                }

        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".keras")
        temp_file.close()

        with zipfile.ZipFile(temp_file.name, "w") as target:
            for info in source.infolist():
                if info.filename == "config.json":
                    target.writestr(info, json.dumps(config).encode("utf-8"))
                else:
                    target.writestr(info, source.read(info.filename))

    return temp_file.name


class ModelManager:
    """Singleton model manager used by the FastAPI backend."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.model = None
        self.model_name = "EfficientNetB0_Oxford102"
        self.num_classes = 102
        self.input_shape = [224, 224, 3]
        self.class_indices = {}
        self.idx_to_class = {}
        self.class_names = {}
        self.is_loaded = False
        self._initialized = True

    def load_model(self, model_path: str = None, class_indices_path: str = None) -> None:
        if model_path is None:
            model_path = os.getenv("MODEL_PATH")

        if class_indices_path is None:
            class_indices_path = os.getenv("CLASS_INDICES_PATH", DEFAULT_CLASS_INDICES_PATH)

        model_path = _resolve_model_path(model_path)
        class_indices_path = _resolve_backend_path(class_indices_path)

        print(f"Loading model from: {model_path}")
        print(f"Loading class indices from: {class_indices_path}")

        self._load_class_indices(class_indices_path)
        self._load_keras_model(model_path)

    def _load_class_indices(self, class_indices_path: str) -> None:
        if os.path.exists(class_indices_path):
            with open(class_indices_path, "r", encoding="utf-8") as f:
                raw_indices = json.load(f)

            sample_value = next(iter(raw_indices.values()))
            if isinstance(sample_value, int):
                print("   Detected format: Numeric indices")
                self.class_indices = raw_indices
                self.idx_to_class = {int(v): k for k, v in raw_indices.items()}
                self.class_names = {
                    class_id: self._class_id_to_name(class_id)
                    for class_id in raw_indices.keys()
                }
            else:
                print("   Detected format: String names")
                sorted_classes = sorted(raw_indices.keys())
                self.class_indices = {
                    class_id: idx for idx, class_id in enumerate(sorted_classes)
                }
                self.idx_to_class = {
                    idx: class_id for class_id, idx in self.class_indices.items()
                }
                self.class_names = raw_indices.copy()
            return

        print(f"Warning: Class indices not found at {class_indices_path}")
        self.class_indices = {f"class_{i:03d}": i for i in range(102)}
        self.idx_to_class = {i: f"class_{i:03d}" for i in range(102)}
        self.class_names = {f"class_{i:03d}": f"Class {i}" for i in range(102)}

    def _load_keras_model(self, model_path: str) -> None:
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")

        safe_model_path = None
        try:
            # Jika model sudah clean (bukan dari notebook), bisa langsung load
            safe_model_path = (
                _create_safe_model_archive(model_path)
                if model_path.endswith(".keras")
                else model_path
            )
            
            self.model = keras.models.load_model(
                safe_model_path,
                compile=False,
                custom_objects=get_custom_objects(),
                safe_mode=False,
            )
            self.is_loaded = True
            self.input_shape = list(self.model.input_shape[1:])
            self.num_classes = self.model.output_shape[1]

            print("Model loaded successfully!")
            print(f"   Input shape: {self.input_shape}")
            print(f"   Output classes: {self.num_classes}")
            print(f"   Total params: {self.model.count_params():,}")
        except Exception as e:
            print(f"Failed to load model: {e}")
            raise
        finally:
            if safe_model_path and safe_model_path != model_path and os.path.exists(safe_model_path):
                os.remove(safe_model_path)

    def _class_id_to_name(self, class_id: str) -> str:
        if "_" in class_id:
            parts = class_id.split("_", 1)
            if parts[0].isdigit():
                return parts[1].replace("_", " ").title() if len(parts) > 1 else class_id
        return class_id.replace("_", " ").title()

    def get_class_name(self, class_id: str) -> str:
        return self.class_names.get(class_id, self._class_id_to_name(class_id))

    def get_class_id_from_index(self, index: int) -> str:
        return self.idx_to_class.get(index, f"unknown_{index}")

    def predict(self, image_array: np.ndarray) -> Tuple[int, float]:
        if not self.is_loaded:
            raise RuntimeError("Model not loaded")

        predictions = self.model.predict(image_array, verbose=0)
        pred_idx = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][pred_idx])
        return pred_idx, confidence


_manager = ModelManager()


def get_model():
    if not _manager.is_loaded:
        _manager.load_model()
    return _manager.model


def get_class_indices():
    if not _manager.class_indices:
        _manager._load_class_indices(DEFAULT_CLASS_INDICES_PATH)
    return _manager.class_indices


def get_num_classes():
    return len(get_class_indices())


def predict(image_array):
    model = get_model()
    preds = model.predict(image_array, verbose=0)
    return preds[0]


def get_top_k(predictions, k=5):
    top_indices = predictions.argsort()[-k:][::-1]
    results = []

    if not _manager.class_names:
        _manager._load_class_indices(DEFAULT_CLASS_INDICES_PATH)

    for idx in top_indices:
        class_id = _manager.get_class_id_from_index(int(idx))
        results.append(
            {
                "class_index": int(idx),
                "class_id": class_id,
                "class_name": _manager.get_class_name(class_id),
                "confidence": round(float(predictions[idx]), 4),
            }
        )

    return results
