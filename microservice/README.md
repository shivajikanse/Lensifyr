# Lensifyr Face Recognition Microservice

An efficient, scalable face detection and embedding generation microservice built with FastAPI, DeepFace, and ArcFace.

## Overview

This microservice handles:

- **Face Detection**: High-accuracy face detection using RetinaFace
- **Embedding Generation**: State-of-the-art 512-dimensional face embeddings using ArcFace
- **Vector Normalization**: Automatic L2 normalization of embeddings
- **Stateless Design**: Lightweight, easily deployable across multiple instances
- **GPU Support**: Optional GPU acceleration for faster inference

## Key Features

### ArcFace Deep Learning Model

- **Accuracy**: 99.8% (state-of-the-art)
- **Embedding Dimension**: 512D (CNN-based deep learning)
- **Margin Loss**: Angular margin optimization for discriminative features
- **Training**: Trained on millions of face images
- **Industry Standard**: Used in production systems globally

### RetinaFace Detection

- **Robust Detection**: Works with various face angles and lighting
- **Multi-scale**: Detects faces of different sizes
- **Alignment**: Automatic face alignment for better embeddings
- **Confidence**: Provides detection confidence scores

## Architecture

The microservice is intentionally **stateless and lightweight**, handling only face recognition tasks:

- ✅ RetinaFace face detection
- ✅ ArcFace 512D embedding generation
- ✅ Vector normalization (L2)
- ✅ Return embeddings to Node.js backend
- ✅ Face verification (optional)

The service **does NOT**:

- ❌ Store images or embeddings
- ❌ Manage MongoDB
- ❌ Handle authentication
- ❌ Perform similarity matching
- ❌ Generate ZIP files

## Requirements

- Python 3.10+
- TensorFlow 2.13+ (for ArcFace model)
- GPU (optional, recommended for production)
- Dependencies listed in `requirements.txt`

## Installation

### 1. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=8000
LOG_LEVEL=INFO
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
FACE_DETECTION_CONFIDENCE=0.5
MAX_IMAGE_SIZE_MB=5
```

## Running the Service

### Development Mode

```bash
# Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python module
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
# Using gunicorn with uvicorn workers (Linux/macOS)
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Or using uvicorn with multiple workers
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker (Optional)

```bash
docker build -t lensifyr-face-engine .
docker run -p 8000:8000 lensifyr-face-engine
```

## API Endpoints

### 1. Health Check

**GET** `/api/health`

Check if the service is running and healthy.

**Response:**

```json
{
  "status": "healthy",
  "service": "Lensifyr Face Recognition Engine",
  "version": "1.0.0"
}
```

### 2. Service Info

**GET** `/api/info`

Get service capabilities and configuration.

**Response:**

```json
{
  "service": "Lensifyr Face Recognition Engine",
  "version": "1.0.0",
  "embedding_model": "ArcFace",
  "detector_backend": "RetinaFace",
  "embedding_dimension": 512,
  "accuracy": "99.8%",
  "approach": "Deep Learning (CNN-based)",
  "supported_formats": ["JPEG", "PNG", "WebP"],
  "max_file_size_mb": 5
}
```

### 3. Generate Embeddings

**POST** `/api/generate-embedding`

Generate face embeddings from an image.

**Request (Base64):**

```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAAA..."
}
```

**Request (URL):**

```json
{
  "image_url": "https://example.com/image.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "embeddings": [
    [0.12, -0.34, 0.56, ..., 0.78],
    [0.11, -0.35, 0.55, ..., 0.77]
  ],
  "face_count": 2,
  "processing_time": 245.32,
  "message": "Successfully detected 2 face(s) and generated embeddings"
}
```

**Error Response:**

```json
{
  "detail": "No faces detected in image"
}
```

## Integration with Node.js Backend

The Node.js backend communicates with this service via HTTP requests:

```javascript
// Example from Node.js
const response = await axios.post(
  "http://localhost:8000/api/generate-embedding",
  { image_base64: base64Image },
);

const embeddings = response.data.embeddings;
```

## Performance Optimization

### Model Configuration

The service uses ArcFace embeddings with RetinaFace detection:

- **Face Detection**: RetinaFace (multi-scale, robust to angles and lighting)
- **Embedding Model**: ArcFace CNN-based deep learning (512D, 99.8% accuracy)
- **Confidence Threshold**: 0.5 (configurable)
- **Max Faces**: Up to 10 faces per image
- **Auto Face Alignment**: Faces are automatically aligned for optimal embedding accuracy

### Image Processing

- **Auto-resize**: Images > 1024px are automatically resized
- **Face Alignment**: Automatic alignment improves embedding accuracy
- **Normalization**: Embeddings are L2-normalized (unit vectors)
- **Multi-detection**: Multiple faces detected and embedded per image

### Production Tips

1. **Enable GPU Acceleration** (Recommended): 10x faster with NVIDIA CUDA
2. **Use Multiple Workers**: Run with `--workers 4+` for concurrency
3. **Load Balancer**: Use Nginx/HAProxy to distribute requests
4. **Caching**: Cache embeddings on Node.js side when possible
5. **Monitoring**: Monitor CPU/GPU usage and response times
6. **Rate Limiting**: Implement rate limiting on the Node.js side

## GPU Acceleration

### NVIDIA CUDA Setup (Recommended)

For 10x performance improvement on NVIDIA GPUs:

```bash
# 1. Install NVIDIA drivers and CUDA toolkit
# Visit: https://developer.nvidia.com/cuda-downloads

# 2. Install TensorFlow with CUDA support
pip install tensorflow[and-cuda]==2.13.0

# 3. Verify GPU detection
python -c "import tensorflow as tf; print('GPU:', len(tf.config.list_physical_devices('GPU')))"

# 4. Run with GPU support
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Performance Improvement:**

- Single face: 300ms (CPU) → 80ms (GPU)
- 5 faces: 500ms (CPU) → 150ms (GPU)

### AMD Radeon (ROCm)

```bash
# Install TensorFlow with ROCm support
pip install tensorflow[and-rocm]==2.13.0
```

### Apple Metal (M1/M2/M3)

Automatic GPU support:

```bash
# TensorFlow detects Apple Metal automatically
pip install tensorflow-metal
```

## Error Handling

The service returns appropriate HTTP status codes:

| Status | Meaning                                     |
| ------ | ------------------------------------------- |
| 200    | Success                                     |
| 400    | Bad request (invalid image, missing fields) |
| 500    | Internal server error                       |
| 503    | Service unavailable                         |

## Testing

### Using cURL

```bash
# Health check
curl http://localhost:8000/api/health

# Generate embedding from URL
curl -X POST http://localhost:8000/api/generate-embedding \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/image.jpg"}'
```

### Using Python

```python
import requests
import base64

# Read and encode image
with open("image.jpg", "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode()

# Generate embedding
response = requests.post(
    "http://localhost:8000/api/generate-embedding",
    json={"image_base64": image_base64}
)

print(response.json())
```

## Deployment

### Linux (Systemd)

Create `/etc/systemd/system/lensifyr-face.service`:

```ini
[Unit]
Description=Lensifyr Face Recognition Service
After=network.target

[Service]
User=appuser
WorkingDirectory=/opt/lensifyr-microservice
Environment="PATH=/opt/lensifyr-microservice/venv/bin"
ExecStart=/opt/lensifyr-microservice/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl start lensifyr-face
sudo systemctl enable lensifyr-face
```

### Cloud Deployment

- **AWS EC2**: Use ECS or Lambda with API Gateway
- **Google Cloud**: Cloud Run (best for stateless services)
- **Azure**: Container Instances or App Service
- **DigitalOcean**: App Platform or Droplets with Docker

## Troubleshooting

### First Startup

- **First run is slow**: Models (~250MB) download and cache automatically
- **Memory spike**: Normal during model loading, settles after first few requests
- **Check logs**: `uvicorn app.main:app --log-level debug`

### Service won't start

```bash
# Check if port 8000 is already in use
lsof -i :8000

# Try a different port
uvicorn app.main:app --port 8001
```

### TensorFlow Issues

```bash
# If TensorFlow fails to load:
pip install --upgrade tensorflow

# For GPU support (NVIDIA CUDA):
pip install tensorflow[and-cuda]

# Check TensorFlow installation:
python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"
```

### Face detection not working

- Ensure image quality is good (min 10x10 pixels)
- Check image format (JPEG, PNG, WebP supported)
- Verify image is not corrupted
- Check `/api/health` endpoint to confirm service is running

### High memory usage

- Reduce `max_faces` configuration in `face_engine.py`
- Process images with lower resolution
- Use multiple service instances with load balancing
- Monitor with: `nvidia-smi` (GPU) or `htop` (CPU)

### Slow response times (CPU)

- Check server CPU/GPU availability
- Monitor network latency with: `curl -w "@curl-format.txt" http://localhost:8000/api/health`
- **Recommended**: Enable GPU acceleration (10x faster)
- Consider scaling horizontally with load balancing

### GPU Not Detected

```bash
# Verify NVIDIA drivers installed:
nvidia-smi

# Check TensorFlow GPU support:
python -c "import tensorflow as tf; print(len(tf.config.list_physical_devices('GPU')))"

# If 0 GPUs found, install CUDA-compatible dependencies:
pip install tensorflow[and-cuda]==2.13.0
```

## Security Considerations

⚠️ **In Production:**

1. **CORS**: Restrict `allow_origins` to trusted domains only
2. **Input Validation**: Already implemented, but monitor for edge cases
3. **Rate Limiting**: Implement on Node.js side or use API Gateway
4. **Authentication**: Validate requests from Node.js backend only
5. **Logging**: Avoid logging sensitive image data
6. **Network**: Run behind internal network/VPN

## Performance Metrics

Typical performance on standard hardware (CPU):

| Operation                         | Time          | Notes                           |
| --------------------------------- | ------------- | ------------------------------- |
| Single face detection & embedding | 150-300ms     | ArcFace (first run slower)      |
| Multiple faces (2-5)              | 250-500ms     | Scales linearly with face count |
| API request overhead              | 10-30ms       | Network I/O                     |
| **Total per image (1 face)**      | **200-400ms** | CPU baseline                    |
| **Total per image (1 face, GPU)** | **50-150ms**  | NVIDIA CUDA (10x faster)        |

**Notes:**

- First startup takes 10-30 seconds for model download (~250MB)
- ArcFace provides 99.8% accuracy (vs 95% with older methods)
- GPU acceleration (NVIDIA CUDA) recommended for production
- Performance improves with TensorFlow optimization

## Directory Structure

```
microservice/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── face_engine.py       # Core face detection logic
│   ├── schemas.py           # Pydantic models
│   └── utils.py             # Helper functions
├── requirements.txt
├── .env.example
└── README.md
```

## Contributing

To extend or modify the service:

1. **Add new models**: Update `face_engine.py`
2. **New endpoints**: Add to `main.py`
3. **Custom embeddings**: Modify `generate_embedding()` method

## License

MIT License - See project LICENSE file

## Support

For issues or questions:

- Check logs: `uvicorn app.main:app --log-level debug`
- Test endpoint: `/api/health`
- Verify connectivity from Node.js backend

## Version

Current: **1.0.0**

Last Updated: March 2, 2026
