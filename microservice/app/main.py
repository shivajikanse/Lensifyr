import logging
import time
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .schemas import (
    EmbeddingRequest,
    EmbeddingResponse,
    HealthCheckResponse,
    ServiceInfoResponse,
    ErrorResponse,
    FindMatchesRequest,
    FindMatchesResponse,
)
from .face_engine import FaceDetectionEngine
from .utils import (
    decode_base64_image,
    load_image_from_url,
    validate_image,
    validate_embedding_vector,
    validate_event_embeddings,
    compute_cosine_similarity_vectorized,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Lensifyr Face Recognition Engine",
    description="Microservice for face detection and embedding generation",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (configure this in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize face detection engine
face_engine: FaceDetectionEngine = None


@app.on_event("startup")
async def startup_event():
    """Initialize face detection engine on startup"""
    global face_engine
    try:
        logger.info("Starting Lensifyr Face Recognition Engine...")
        face_engine = FaceDetectionEngine()
        logger.info("Face detection engine initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize face detection engine: {str(e)}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    global face_engine
    try:
        if face_engine:
            face_engine.close()
        logger.info("Face detection engine stopped")
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")


@app.get("/api/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check endpoint
    
    Returns:
        dict: Health status
    """
    return {
        "status": "healthy",
        "service": "Lensifyr Face Recognition Engine",
        "version": "1.0.0",
    }


@app.get("/api/info", response_model=ServiceInfoResponse)
async def service_info():
    """
    Get service information
    
    Returns:
        dict: Service metadata and capabilities
    """
    return {
        "service": "Lensifyr Face Recognition Engine (ArcFace)",
        "version": "1.0.0",
        "embedding_dimension": 512,
        "embedding_model": "ArcFace",
        "detector_backend": "RetinaFace",
        "supported_formats": ["JPEG", "PNG", "WebP"],
        "max_file_size_mb": 5,
        "accuracy": "99.8%",
        "approach": "Deep Learning (CNN-based)"
    }


@app.post("/api/generate-embedding", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    """
    Generate face embeddings from image
    
    Args:
        request: EmbeddingRequest containing either image_base64 or image_url
        
    Returns:
        dict: Embeddings, face count, and processing time
        
    Raises:
        HTTPException: If image processing fails
    """
    global face_engine

    if not face_engine:
        logger.error("Face detection engine not initialized")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Face detection service not ready",
        )

    try:
        # Log request details
        logger.info(f"Received request - has_base64: {bool(request.image_base64)}, has_url: {bool(request.image_url)}")
        if request.image_base64:
            logger.info(f"Base64 image size: {len(request.image_base64)} characters")
        if request.image_url:
            logger.info(f"Image URL: {request.image_url}")

        # Validate request
        if not request.image_base64 and not request.image_url:
            raise ValueError("Either image_base64 or image_url must be provided")

        if request.image_base64 and request.image_url:
            raise ValueError("Please provide only one of image_base64 or image_url")

        # Load image
        start_time = time.time()
        logger.info("Loading image...")

        if request.image_base64:
            logger.debug("Decoding base64 image")
            image = decode_base64_image(request.image_base64)
        else:
            logger.debug(f"Loading image from URL: {request.image_url}")
            image = load_image_from_url(request.image_url)

        # Validate image
        is_valid, message = validate_image(image)
        if not is_valid:
            raise ValueError(message)

        logger.info("Image loaded successfully. Processing...")

        # Process image and generate embeddings
        embeddings, face_count = face_engine.process_image(image)

        end_time = time.time()
        processing_time = (end_time - start_time) * 1000  # Convert to milliseconds

        logger.info(
            f"Successfully processed image with {face_count} face(s) in {processing_time:.2f}ms"
        )

        return {
            "success": True,
            "embeddings": embeddings,
            "face_count": face_count,
            "processing_time": round(processing_time, 2),
            "message": f"Successfully detected {face_count} face(s) and generated embeddings",
        }

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process image: {str(e)}",
        )


@app.post("/api/find-matches", response_model=FindMatchesResponse)
async def find_matches(request: FindMatchesRequest):
    """
    Find matching faces using vectorized cosine similarity.
    
    This endpoint takes a selfie embedding and compares it against all event embeddings
    using NumPy vectorization for high performance.
    
    Args:
        request: FindMatchesRequest containing:
            - selfie_embedding: 512D embedding from user's selfie
            - event_embeddings: List of {id, embedding} for all event images
            - threshold: Similarity threshold (0-1)
    
    Returns:
        FindMatchesResponse: List of matches with scores, sorted by score descending
        
    Raises:
        HTTPException: If validation fails or processing error occurs
    """
    try:
        start_time = time.time()
        
        logger.info(
            f"Received find-matches request: "
            f"selfie_emb_dim={len(request.selfie_embedding)}, "
            f"event_count={len(request.event_embeddings)}, "
            f"threshold={request.threshold}"
        )
        
        # Validate selfie embedding
        is_valid, msg = validate_embedding_vector(request.selfie_embedding)
        if not is_valid:
            logger.warning(f"Invalid selfie embedding: {msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid selfie_embedding: {msg}",
            )
        
        # Validate event embeddings
        is_valid, msg = validate_event_embeddings(request.event_embeddings)
        if not is_valid:
            logger.warning(f"Invalid event embeddings: {msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid event_embeddings: {msg}",
            )
        
        # Validate threshold
        if not (0 <= request.threshold <= 1):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Threshold must be between 0 and 1",
            )
        
        logger.info("Input validation passed, computing similarities...")
        
        # Compute vectorized cosine similarity
        all_matches = compute_cosine_similarity_vectorized(
            request.selfie_embedding,
            request.event_embeddings
        )
        
        # Filter by threshold
        filtered_matches = [m for m in all_matches if m["score"] >= request.threshold]
        
        end_time = time.time()
        processing_time = (end_time - start_time) * 1000  # Convert to milliseconds
        
        match_count = len(filtered_matches)
        logger.info(
            f"Similarity computation completed: {match_count} matches above threshold "
            f"(out of {len(all_matches)}) in {processing_time:.2f}ms"
        )
        
        return {
            "success": True,
            "matches": filtered_matches,
            "match_count": match_count,
            "processing_time": round(processing_time, 2),
            "message": f"Found {match_count} matching image(s)",
        }
    
    except HTTPException:
        raise
    
    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    
    except Exception as e:
        logger.error(f"Error computing similarity matches: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compute matches: {str(e)}",
        )


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Lensifyr Face Recognition Engine",
        "documentation": "/docs",
        "health": "/api/health",
    }


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Internal server error",
            "error_code": "INTERNAL_ERROR",
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
    )
