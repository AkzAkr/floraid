"""
FloraID Backend API
FastAPI-based backend for flower species classification

Endpoints:
    POST /predict          - Classify flower image
    POST /gradcam          - Generate GradCAM heatmap
    GET  /species/{id}     - Get species details + enrichment
    GET  /health           - Health check
    GET  /                 - API info

Author: FloraID Team
"""

import os
import io
import base64
import json
import time
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Import internal modules
from api.predict import predict_image
from api.gradcam import compute_gradcam_heatmap, generate_gradcam
from api.species import get_species_details, search_species
from utils.model_loader import ModelManager
from utils.image_processing import (
    extract_attention_color_palette,
    extract_color_palette,
    preprocess_image,
    validate_image,
)

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app
app = FastAPI(
    title="FloraID API",
    description="AI-powered flower species classification for 102 Oxford Flowers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model manager
model_manager = ModelManager()

# ============================================================================
# Pydantic Models
# ============================================================================

class PredictionResult(BaseModel):
    rank: int
    class_id: str
    class_name: str
    confidence: float
    confidence_percent: str

class PredictResponse(BaseModel):
    success: bool
    filename: str
    top_prediction: PredictionResult
    top_5_predictions: List[PredictionResult]
    processing_time_ms: float
    image_size: dict
    color_palette: List[str]
    timestamp: str

class GradCAMResponse(BaseModel):
    success: bool
    filename: str
    predicted_class: str
    confidence: float
    heatmap_base64: str
    overlay_base64: str
    processing_time_ms: float
    timestamp: str

class SpeciesInfo(BaseModel):
    class_id: str
    class_name: str
    common_name: Optional[str]
    scientific_name: Optional[str]
    family: Optional[str] = None
    description: Optional[str]
    habitat: Optional[str]
    native_region: Optional[str]
    bloom_season: Optional[str] = None
    colors: Optional[List[str]] = None
    care_tips: Optional[List[str]]
    fun_facts: Optional[List[str]]
    image_url: Optional[str]
    wikipedia_url: Optional[str]
    gbif_url: Optional[str]

class SpeciesResponse(BaseModel):
    success: bool
    species: SpeciesInfo
    source: str
    fetched_at: str

class HealthResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    status: str
    model_loaded: bool
    model_name: str
    num_classes: int
    input_shape: List[int]
    uptime_seconds: float
    version: str

# ============================================================================
# Startup Event
# ============================================================================

_start_time = time.time()

@app.on_event("startup")
async def startup_event():
    """Load model on startup."""
    print("FloraID Backend Starting...")
    try:
        model_manager.load_model()
        print(f"Model loaded: {model_manager.model_name}")
        print(f"Classes: {model_manager.num_classes}")
        print(f"Input shape: {model_manager.input_shape}")
    except Exception as e:
        print(f"Failed to load model: {e}")
        print("Warning: Running in fallback mode - predictions will not work!")
        print("Warning: Please ensure model files are in backend/models/")
        # Don't raise - allow server to start for debugging

# ============================================================================
# Routes
# ============================================================================

@app.get("/", response_model=dict)
async def root():
    """API information."""
    return {
        "name": "FloraID API",
        "version": "1.0.0",
        "description": "AI-powered flower species classification",
        "endpoints": {
            "predict": "POST /predict - Classify flower image",
            "gradcam": "POST /gradcam - Generate GradCAM heatmap",
            "species": "GET /species/{id} - Get species details",
            "health": "GET /health - Health check"
        },
        "documentation": "/docs",
        "model": "EfficientNetB0 (Oxford 102 Flowers)",
        "metrics": {
            "accuracy": "84.65%",
            "top5_accuracy": "95.98%",
            "f1_score": "84.5%"
        }
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy" if model_manager.is_loaded else "degraded",
        model_loaded=model_manager.is_loaded,
        model_name=model_manager.model_name,
        num_classes=model_manager.num_classes,
        input_shape=model_manager.input_shape,
        uptime_seconds=round(time.time() - _start_time, 2),
        version="1.0.0"
    )


@app.post("/predict", response_model=PredictResponse)
@limiter.limit("10/minute")
async def predict(
    request: Request,
    file: UploadFile = File(..., description="Flower image to classify (JPG/PNG, max 10MB)")
):
    """
    Classify a flower image and return top-5 predictions.

    - **file**: Upload image file (JPG/PNG, max 10MB)
    - Returns: Top-5 predictions with confidence scores
    """
    if not model_manager.is_loaded:
        try:
            model_manager.load_model()
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=f"Model not loaded. Please check server logs: {e}",
            )

    start_time = time.time()

    # Validate file
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (JPG/PNG)")

    # Read and validate image
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=413, detail="Image too large (max 10MB)")

    try:
        # Validate and preprocess
        img = validate_image(contents)
        processed_img = preprocess_image(img, model_manager.input_shape[:2])

        # Get predictions
        predictions = predict_image(model_manager, processed_img)

        try:
            gradcam_result = compute_gradcam_heatmap(
                model_manager,
                processed_img,
                pred_class_idx=predictions[0].get("class_index"),
            )
            color_palette = extract_attention_color_palette(img, gradcam_result["heatmap"])
        except Exception as e:
            print(f"Warning: Attention palette failed, using whole-image palette: {e}")
            color_palette = extract_color_palette(img)

        # Format response
        top_5 = []
        for i, pred in enumerate(predictions):
            top_5.append(PredictionResult(
                rank=i + 1,
                class_id=pred["class_id"],
                class_name=pred["class_name"],
                confidence=pred["confidence"],
                confidence_percent=f"{pred['confidence']:.2%}"
            ))

        processing_time = (time.time() - start_time) * 1000

        return PredictResponse(
            success=True,
            filename=file.filename,
            top_prediction=top_5[0],
            top_5_predictions=top_5,
            processing_time_ms=round(processing_time, 2),
            image_size={"width": img.width, "height": img.height},
            color_palette=color_palette,
            timestamp=datetime.utcnow().isoformat()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/gradcam", response_model=GradCAMResponse)
@limiter.limit("10/minute")
async def gradcam(
    request: Request,
    file: UploadFile = File(..., description="Flower image for GradCAM (JPG/PNG, max 10MB)")
):
    """
    Generate GradCAM heatmap for model interpretability.

    - **file**: Upload image file (JPG/PNG, max 10MB)
    - Returns: Heatmap and overlay images as base64
    """
    if not model_manager.is_loaded:
        try:
            model_manager.load_model()
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=f"Model not loaded. Please check server logs: {e}",
            )

    start_time = time.time()

    # Validate file
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (JPG/PNG)")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image too large (max 10MB)")

    try:
        # Validate and preprocess
        img = validate_image(contents)
        processed_img = preprocess_image(img, model_manager.input_shape[:2])

        # Generate GradCAM
        result = generate_gradcam(model_manager, processed_img, img)

        processing_time = (time.time() - start_time) * 1000

        return GradCAMResponse(
            success=True,
            filename=file.filename,
            predicted_class=result["predicted_class"],
            confidence=result["confidence"],
            heatmap_base64=result["heatmap_base64"],
            overlay_base64=result["overlay_base64"],
            processing_time_ms=round(processing_time, 2),
            timestamp=datetime.utcnow().isoformat()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GradCAM failed: {str(e)}")


@app.get("/species/{class_id}", response_model=SpeciesResponse)
@limiter.limit("30/minute")
async def species_detail(
    request: Request,
    class_id: str,
    enrich: bool = True
):
    """
    Get detailed information about a flower species.

    - **class_id**: Class ID (e.g., "class_001", "001_pink_primrose")
    - **enrich**: Auto-fetch from Wikipedia/GBIF (default: true)
    - Returns: Species details with enrichment data
    """
    try:
        species_info = get_species_details(class_id, enrich=enrich)

        return SpeciesResponse(
            success=True,
            species=SpeciesInfo(**species_info),
            source="wikipedia+gbif" if enrich else "local",
            fetched_at=datetime.utcnow().isoformat()
        )

    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Species not found: {str(e)}")


@app.get("/species", response_model=dict)
@limiter.limit("30/minute")
async def list_species(
    request: Request,
    query: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    """
    Search and list available flower species.

    - **query**: Search by name (optional)
    - **limit**: Max results (default: 20)
    - **offset**: Pagination offset (default: 0)
    """
    results = search_species(query=query, limit=limit, offset=offset)

    return {
        "success": True,
        "total": results["total"],
        "limit": limit,
        "offset": offset,
        "species": results["species"]
    }


# ============================================================================
# Error Handlers
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if os.getenv("DEBUG") == "true" else None
        }
    )


# ============================================================================
# Run Server (for local development)
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "false").lower() == "true",
        workers=1
    )
