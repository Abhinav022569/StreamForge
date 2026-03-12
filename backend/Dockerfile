# Use Python 3.12 slim
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies for pandas/matplotlib
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Create directories for data persistence
RUN mkdir -p uploads processed db

# Expose the port
EXPOSE 5000

# Run the app
CMD ["python", "run.py"]