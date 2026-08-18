FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OpenCV and Postgres
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1 \
    libgomp1 \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create required directories
RUN mkdir -p images/rgb images/thermal images/annotated reports models

EXPOSE 8000
