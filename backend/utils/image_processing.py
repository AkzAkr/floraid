"""
Image Processing Utility
Handle image validation, preprocessing, and format conversion
"""

import io
import numpy as np
from PIL import Image
from typing import Tuple


def validate_image(image_bytes: bytes) -> Image.Image:
    """
    Validate and load image from bytes.

    Args:
        image_bytes: Raw image bytes

    Returns:
        PIL Image object

    Raises:
        ValueError: If image is invalid
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))

        # Validate format
        if img.format not in ["JPEG", "JPG", "PNG", "WEBP"]:
            raise ValueError(f"Unsupported image format: {img.format}")

        # Convert to RGB if necessary
        if img.mode != "RGB":
            img = img.convert("RGB")

        # Check dimensions
        if img.width < 32 or img.height < 32:
            raise ValueError("Image too small (minimum 32x32)")

        if img.width > 4096 or img.height > 4096:
            raise ValueError("Image too large (maximum 4096x4096)")

        return img

    except Exception as e:
        raise ValueError(f"Invalid image: {str(e)}")


def preprocess_image(img: Image.Image, target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
    """
    Preprocess image untuk model inference.
    
    EfficientNet preprocess_input expects the [0, 255] uint8 range.
    Jangan di-normalize ke [0, 1] dulu!
    """
    # Resize
    img_resized = img.resize(target_size, Image.Resampling.LANCZOS)
    
    # Convert ke numpy array, tetap uint8 [0, 255]
    img_array = np.array(img_resized, dtype=np.uint8)
    
    # Do not normalize to [0, 1]; EfficientNetPreprocess handles scaling.
    
    return img_array  # Shape: (224, 224, 3), dtype: uint8, range: [0, 255]


def preprocess_for_gradcam(img: Image.Image, target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
    """
    Preprocess image specifically for GradCAM.
    Same as preprocess_image but returns batch dimension.

    Args:
        img: PIL Image (RGB)
        target_size: Target (width, height)

    Returns:
        Normalized numpy array with batch dim (1, H, W, C)
    """
    img_array = preprocess_image(img, target_size)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def resize_with_aspect_ratio(img: Image.Image, max_size: int = 1024) -> Image.Image:
    """
    Resize image maintaining aspect ratio.

    Args:
        img: PIL Image
        max_size: Maximum dimension

    Returns:
        Resized PIL Image
    """
    width, height = img.size

    if max(width, height) > max_size:
        ratio = max_size / max(width, height)
        new_width = int(width * ratio)
        new_height = int(height * ratio)
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

    return img


def get_image_info(img: Image.Image) -> dict:
    """Get image metadata."""
    return {
        "width": img.width,
        "height": img.height,
        "mode": img.mode,
        "format": img.format,
        "aspect_ratio": round(img.width / img.height, 2)
    }


def extract_color_palette(img: Image.Image, num_colors: int = 4) -> list[str]:
    """Extract a compact dominant color palette from a PIL image."""
    palette_img = img.convert("RGB").resize((160, 160), Image.Resampling.LANCZOS)
    quantized = palette_img.quantize(colors=max(num_colors * 3, 8), method=Image.Quantize.MEDIANCUT)
    palette = quantized.getpalette() or []
    color_counts = quantized.getcolors(maxcolors=160 * 160) or []

    colors = []
    for count, palette_index in sorted(color_counts, reverse=True):
        offset = palette_index * 3
        rgb = tuple(palette[offset:offset + 3])
        if len(rgb) != 3:
            continue

        r, g, b = rgb
        # Skip near-white background colors unless there are too few swatches.
        if len(colors) >= 2 and r > 235 and g > 235 and b > 235:
            continue

        hex_color = f"#{r:02X}{g:02X}{b:02X}"
        if hex_color not in colors:
            colors.append(hex_color)

        if len(colors) >= num_colors:
            break

    return colors or ["#5B8C5A", "#F4D03F", "#D4A574", "#E8EDE8"]


def extract_attention_color_palette(
    img: Image.Image,
    heatmap: np.ndarray,
    num_colors: int = 4,
) -> list[str]:
    """Extract dominant colors from the high-attention GradCAM region."""
    if heatmap.size == 0 or float(np.max(heatmap)) <= 0:
        return extract_color_palette(img, num_colors)

    rgb_img = img.convert("RGB")
    mask_img = Image.fromarray(np.uint8(np.clip(heatmap, 0, 1) * 255))
    mask_img = mask_img.resize(rgb_img.size, Image.Resampling.BILINEAR)

    image_pixels = np.array(rgb_img, dtype=np.uint8).reshape(-1, 3)
    attention = np.array(mask_img, dtype=np.float32).reshape(-1) / 255.0

    active_attention = attention[attention > 0]
    if active_attention.size == 0:
        return extract_color_palette(img, num_colors)

    threshold = max(0.35, float(np.percentile(active_attention, 70)))
    selected = image_pixels[attention >= threshold]

    if selected.shape[0] < 64:
        selected = image_pixels[attention >= max(0.15, float(np.percentile(active_attention, 50)))]

    if selected.shape[0] < 64:
        return extract_color_palette(img, num_colors)

    # Keep the most attended pixels so the quantizer is driven by the subject,
    # not by a large diffuse background area.
    selected_weights = attention[attention >= threshold]
    if selected.shape[0] > 25000 and selected_weights.shape[0] == selected.shape[0]:
        top_indices = np.argsort(selected_weights)[-25000:]
        selected = selected[top_indices]
    elif selected.shape[0] > 25000:
        selected = selected[:25000]

    side = int(np.ceil(np.sqrt(selected.shape[0])))
    padded = np.empty((side * side, 3), dtype=np.uint8)
    padded[:selected.shape[0]] = selected
    padded[selected.shape[0]:] = selected[-1]
    palette_source = Image.fromarray(padded.reshape(side, side, 3), mode="RGB")

    quantized = palette_source.quantize(
        colors=max(num_colors * 4, 8),
        method=Image.Quantize.MEDIANCUT,
    )
    palette = quantized.getpalette() or []
    color_counts = quantized.getcolors(maxcolors=side * side) or []

    colors = []
    delayed_neutrals = []
    for count, palette_index in sorted(color_counts, reverse=True):
        offset = palette_index * 3
        rgb = tuple(palette[offset:offset + 3])
        if len(rgb) != 3:
            continue

        r, g, b = rgb
        max_channel = max(r, g, b)
        min_channel = min(r, g, b)
        saturation = 0 if max_channel == 0 else (max_channel - min_channel) / max_channel

        if max_channel > 225 and saturation < 0.12 and len(colors) >= 1:
            delayed_neutrals.append(f"#{r:02X}{g:02X}{b:02X}")
            continue

        hex_color = f"#{r:02X}{g:02X}{b:02X}"
        if hex_color in colors:
            continue

        colors.append(hex_color)
        if len(colors) >= num_colors:
            break

    for color in delayed_neutrals:
        if len(colors) >= num_colors:
            break
        if color not in colors:
            colors.append(color)

    if len(colors) < num_colors:
        for color in extract_color_palette(img, num_colors):
            if color not in colors:
                colors.append(color)
            if len(colors) >= num_colors:
                break

    return colors or extract_color_palette(img, num_colors)
