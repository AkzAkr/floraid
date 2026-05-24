# FloraID Backend for Hugging Face Spaces
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV TF_CPP_MIN_LOG_LEVEL=2
ENV PORT=7860
ENV MODEL_PATH=models/efficientnetb0_flowers102_clean.keras
ENV CLASS_INDICES_PATH=models/class_indices.json
ENV MAX_IMAGE_SIZE=5242880
ENV RATE_LIMIT=10/minute
ENV CORS_ORIGINS=*

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY api/ ./api/
COPY utils/ ./utils/
COPY models/ ./models/

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-7860} --workers 1"]
