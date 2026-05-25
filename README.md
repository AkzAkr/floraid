# FloraID

FloraID is an AI-powered flower identification web app for classifying Oxford 102 flower species from uploaded images. It combines a Next.js frontend, a FastAPI backend, and a TensorFlow EfficientNetB0 model with GradCAM model-attention visualization.

## Live Demo

- Frontend: `https://floraid.vercel.app/`
- Backend API: `https://ivchzzz-floraid-backend.hf.space`

## Features

- Flower image prediction with confidence score
- Top prediction alternatives
- GradCAM attention map for model transparency
- Species gallery with real metadata and local images
- Species detail pages
- Save favorite species to collection
- Recent predictions stored locally
- English and Indonesian UI language toggle
- Responsive dark/light themed interface

## Tech Stack

### Frontend

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- Vercel

### Backend

- FastAPI
- TensorFlow / Keras
- EfficientNetB0
- OpenCV / Pillow
- Hugging Face Spaces Docker

## Project Structure

```txt
floraID/
|-- backend/                 # FastAPI backend source
|   |-- api/                 # Predict, GradCAM, species routes
|   |-- models/              # Model and metadata files
|   |-- utils/               # Model loading and image processing
|   |-- app.py
|   `-- requirements.txt
|-- frontend/                # Next.js frontend
|   |-- public/species/      # Gallery species images
|   `-- src/
|-- hf-backend/              # Hugging Face Spaces Docker deployment folder
`-- docs/
```

## Local Development

### 1. Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Backend health check:

```txt
http://localhost:8000/health
```

### 2. Frontend

Create `frontend/.env.local`:

```txt
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the app:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at:

```txt
http://localhost:3000
```

## Deployment

### Frontend

The frontend is deployed on Vercel.

Vercel settings:

```txt
Root Directory: frontend
Build Command: npm run build
Output Directory: Next.js default
```

Environment variable:

```txt
NEXT_PUBLIC_API_URL=https://ivchzzz-floraid-backend.hf.space
```

### Backend

The backend is deployed on Hugging Face Spaces using Docker.

The deployable backend lives in:

```txt
hf-backend/
```

Hugging Face Space settings:

```txt
SDK: Docker
Hardware: CPU Basic
Port: 7860
```

The TensorFlow model is stored with Git LFS because `.keras` files exceed Hugging Face's normal Git file limit.

## API Endpoints

```txt
GET  /health       Health check
POST /predict      Predict flower species from image
POST /gradcam      Generate GradCAM heatmap and overlay
GET  /species      List species metadata
GET  /species/{id} Get species detail
```

## Notes

- Dataset folders such as `data/raw`, `data/cleaned`, and `data/processed` are not included in GitHub.
- Python virtual environments, `node_modules`, build outputs, logs, and local `.env` files are ignored.
- The deployed backend currently uses `efficientnetb0_flowers102_clean.keras` for a smaller Docker/LFS footprint.

## Author

Anang Ismail
