"""
Prediction API Module
Handle image classification using loaded EfficientNetB0 model
"""

import numpy as np
from typing import List, Dict


def predict_image(model_manager, processed_img: np.ndarray) -> List[Dict]:
    """
    Predict flower species from preprocessed image.

    Args:
        model_manager: Loaded ModelManager instance
        processed_img: Preprocessed image array (1, 224, 224, 3)

    Returns:
        List of top-5 predictions with class info and confidence
    """
    # Ensure batch dimension
    if len(processed_img.shape) == 3:
        processed_img = np.expand_dims(processed_img, axis=0)

    # Predict
    predictions = model_manager.model.predict(processed_img, verbose=0)
    pred_probs = predictions[0]

    # Get top-5 indices
    top_5_indices = np.argsort(pred_probs)[::-1][:5]

    # Format results
    results = []
    for idx in top_5_indices:
        class_id = model_manager.idx_to_class[int(idx)]
        class_name = model_manager.class_names.get(class_id, class_id)
        confidence = float(pred_probs[idx])

        results.append({
            "class_index": int(idx),
            "class_id": class_id,
            "class_name": class_name,
            "confidence": confidence,
            "confidence_raw": pred_probs[idx]
        })

    return results
