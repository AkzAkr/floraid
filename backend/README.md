# 🌸 FloraID Backend

FastAPI-based backend for AI-powered flower species classification.

## 📋 Features

| Feature | Status |
|---------|--------|
| Image Classification (Top-5) | ✅ |
| GradCAM Heatmap Generation | ✅ |
| Species Detail + Enrichment | ✅ |
| Rate Limiting (10 req/min) | ✅ |
| CORS Support | ✅ |
| Docker Support | ✅ |

## 🚀 Quick Start

### 1. Setup Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Add Model Files

Download from Kaggle training output and place in `models/`:

```bash
models/
├── efficientnetb0_flowers102.keras   # ~78MB
└── class_indices.json                # Class mapping
```

### 3. Run Locally

```bash
# Development (with auto-reload)
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 1
```

### 4. Test API

```bash
# Health check
curl http://localhost:8000/health

# Predict (upload image)
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@flower.jpg"

# GradCAM
curl -X POST "http://localhost:8000/gradcam" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@flower.jpg"

# Species detail
curl "http://localhost:8000/species/class_001"
```

## 🐳 Docker

### Build & Run

```bash
docker-compose up --build
```

Services:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## 📡 API Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/` | API info | - |
| GET | `/health` | Health check | - |
| POST | `/predict` | Classify image | 10/min |
| POST | `/gradcam` | Generate heatmap | 10/min |
| GET | `/species/{id}` | Species details | 30/min |
| GET | `/species` | List/search species | 30/min |

## 📦 Project Structure

```
backend/
├── app.py                 # FastAPI main application
├── requirements.txt       # Python dependencies
├── Dockerfile            # Container image
├── .env.example          # Environment variables template
├── api/
│   ├── __init__.py
│   ├── predict.py        # Prediction endpoint logic
│   ├── gradcam.py        # GradCAM heatmap generation
│   └── species.py        # Species detail + enrichment
├── utils/
│   ├── __init__.py
│   ├── model_loader.py   # Model loading & management
│   ├── image_processing.py  # Image validation & preprocessing
│   └── data_enrichment.py   # Wikipedia/GBIF fetching
└── models/
    ├── efficientnetb0_flowers102.keras  # Trained model
    └── class_indices.json               # Class mapping
```

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8000 | Server port |
| `MODEL_PATH` | models/... | Path to model file |
| `CLASS_INDICES_PATH` | models/... | Path to class indices |
| `MAX_IMAGE_SIZE` | 5242880 | Max upload size (bytes) |
| `RATE_LIMIT` | 10/minute | API rate limit |
| `CORS_ORIGINS` | * | Allowed CORS origins |
| `DEBUG` | false | Debug mode |

## 📝 Response Examples

### Predict Response
```json
{
  "success": true,
  "filename": "flower.jpg",
  "top_prediction": {
    "rank": 1,
    "class_id": "class_001",
    "class_name": "Pink Primrose",
    "confidence": 0.9234,
    "confidence_percent": "92.34%"
  },
  "top_5_predictions": [...],
  "processing_time_ms": 145.23,
  "image_size": {"width": 1024, "height": 768},
  "timestamp": "2024-01-15T10:30:00"
}
```

### GradCAM Response
```json
{
  "success": true,
  "filename": "flower.jpg",
  "predicted_class": "Pink Primrose",
  "confidence": 0.9234,
  "heatmap_base64": "data:image/png;base64,iVBORw0...",
  "overlay_base64": "data:image/png;base64,iVBORw0...",
  "processing_time_ms": 320.45,
  "timestamp": "2024-01-15T10:30:01"
}
```

## 🎯 Model Metrics

- **Accuracy**: 84.65%
- **Top-5 Accuracy**: 95.98%
- **F1-Score**: 84.5%
- **Model Size**: 78 MB (.keras)
- **Input Size**: 224×224×3
- **Classes**: 102 Oxford Flowers

## 🔗 Frontend Integration

Update frontend API client:

```typescript
// frontend/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const predictFlower = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  return response.json();
};
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Model not found | Check `MODEL_PATH` env var |
| CORS errors | Update `CORS_ORIGINS` |
| Out of memory | Reduce batch size or use smaller model |
| Slow inference | Enable GPU or reduce image size |

## 📄 License

MIT License - FloraID Team
