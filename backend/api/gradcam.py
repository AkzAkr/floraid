"""
GradCAM API Module
Generate GradCAM heatmaps for model interpretability
"""

import numpy as np
import cv2
import base64
from io import BytesIO
from typing import Dict, Optional, Tuple
import tensorflow as tf
from PIL import Image


def _find_last_conv_layer(model: tf.keras.Model) -> Tuple[Optional[tf.keras.Model], tf.keras.layers.Layer, int]:
    """Find the last usable Conv2D layer, including Conv2D layers inside nested models."""
    for outer_index in range(len(model.layers) - 1, -1, -1):
        layer = model.layers[outer_index]

        if isinstance(layer, tf.keras.layers.Conv2D):
            return None, layer, outer_index

        if hasattr(layer, "layers"):
            for nested_layer in reversed(layer.layers):
                if isinstance(nested_layer, tf.keras.layers.Conv2D):
                    return layer, nested_layer, outer_index

    raise ValueError("Could not find convolutional layer for GradCAM")


def compute_gradcam_heatmap(
    model_manager,
    processed_img: np.ndarray,
    pred_class_idx: Optional[int] = None,
) -> Dict:
    """
    Compute a raw GradCAM heatmap for the predicted or supplied class index.

    Returns a normalized heatmap in the [0, 1] range plus class metadata.
    """
    if len(processed_img.shape) == 3:
        processed_img = np.expand_dims(processed_img, axis=0)

    nested_model, last_conv_layer, outer_index = _find_last_conv_layer(model_manager.model)
    last_conv_layer_name = last_conv_layer.name

    with tf.GradientTape() as tape:
        if nested_model is None:
            grad_model = tf.keras.models.Model(
                model_manager.model.inputs,
                [last_conv_layer.output, model_manager.model.output],
            )
            conv_outputs, predictions = grad_model(processed_img, training=False)
        else:
            x = tf.convert_to_tensor(processed_img)

            for layer in model_manager.model.layers[1:outer_index]:
                x = layer(x, training=False)

            feature_model = tf.keras.models.Model(
                nested_model.inputs,
                [last_conv_layer.output, nested_model.outputs[0]],
            )
            conv_outputs, x = feature_model(x, training=False)

            for layer in model_manager.model.layers[outer_index + 1:]:
                x = layer(x, training=False)

            predictions = x

        if pred_class_idx is None:
            pred_class_idx = int(tf.argmax(predictions[0]).numpy())

        class_channel = predictions[:, pred_class_idx]

    grads = tape.gradient(class_channel, conv_outputs)
    if grads is None:
        raise ValueError("Could not compute GradCAM gradients")

    conv_outputs = tf.cast(conv_outputs[0], tf.float32)
    grads = tf.cast(grads, tf.float32)

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    heatmap = tf.maximum(heatmap, 0)
    max_value = tf.math.reduce_max(heatmap)
    heatmap = tf.where(max_value > 0, heatmap / max_value, heatmap)
    heatmap = np.nan_to_num(heatmap.numpy(), nan=0.0, posinf=0.0, neginf=0.0)

    return {
        "heatmap": heatmap,
        "pred_class_idx": int(pred_class_idx),
        "confidence": float(predictions[0][pred_class_idx].numpy()),
        "layer_used": last_conv_layer_name,
    }


def generate_gradcam(model_manager, processed_img: np.ndarray, original_img) -> Dict:
    """
    Generate GradCAM heatmap for the predicted class.

    Args:
        model_manager: Loaded ModelManager instance
        processed_img: Preprocessed image (1, 224, 224, 3)
        original_img: PIL Image (original size)

    Returns:
        Dict with predicted_class, confidence, heatmap_base64, overlay_base64
    """
    gradcam_result = compute_gradcam_heatmap(model_manager, processed_img)
    pred_class_idx = gradcam_result["pred_class_idx"]
    confidence = gradcam_result["confidence"]
    heatmap = gradcam_result["heatmap"]
    last_conv_layer_name = gradcam_result["layer_used"]

    class_id = model_manager.idx_to_class[pred_class_idx]
    class_name = model_manager.class_names.get(class_id, class_id)

    # Convert to image
    heatmap_img = np.uint8(255 * heatmap)
    heatmap_img = cv2.applyColorMap(heatmap_img, cv2.COLORMAP_JET)
    heatmap_img = cv2.cvtColor(heatmap_img, cv2.COLOR_BGR2RGB)

    # Resize to original image size
    original_array = np.array(original_img)
    heatmap_resized = cv2.resize(heatmap_img, (original_array.shape[1], original_array.shape[0]))

    # Create overlay
    overlay = cv2.addWeighted(original_array, 0.6, heatmap_resized, 0.4, 0)

    # Convert to base64
    heatmap_pil = Image.fromarray(heatmap_resized)
    overlay_pil = Image.fromarray(overlay)

    heatmap_base64 = image_to_base64(heatmap_pil)
    overlay_base64 = image_to_base64(overlay_pil)

    return {
        "predicted_class": class_name,
        "confidence": confidence,
        "heatmap_base64": heatmap_base64,
        "overlay_base64": overlay_base64,
        "layer_used": last_conv_layer_name
    }


def image_to_base64(img) -> str:
    """Convert PIL Image to base64 string."""
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{img_base64}"
