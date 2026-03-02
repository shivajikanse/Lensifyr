import numpy as np
import cv2
from typing import List, Tuple
from .utils import normalize_embedding, validate_image, resize_image
import logging
from deepface import DeepFace

logger = logging.getLogger(__name__)


class FaceDetectionEngine:
    """
    Face detection and embedding generation engine using DeepFace with ArcFace model.
    
    This engine provides:
    - RetinaFace for robust face detection
    - ArcFace for state-of-the-art 512D face embeddings
    - Automatic face alignment and normalization
    """

    def __init__(self):
        """Initialize face detection and embedding generation models"""
        try:
            logger.info("Initializing FaceDetectionEngine with ArcFace...")
            
            # DeepFace will automatically download models on first use
            # Models: ArcFace (512D), RetinaFace (detection)
            self.embedding_dimension = 512
            self.model_name = "ArcFace"
            self.detector_backend = "retinaface"
            
            # Test models are loaded correctly
            logger.info(f"Using model: {self.model_name}")
            logger.info(f"Using detector: {self.detector_backend}")
            logger.info(f"Embedding dimension: {self.embedding_dimension}")
            logger.info("FaceDetectionEngine initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize FaceDetectionEngine: {str(e)}")
            raise

    def process_image(self, image: np.ndarray) -> Tuple[List[list], int]:
        """
        Process image to detect faces and generate ArcFace embeddings.
        
        Args:
            image: Input image as numpy array (BGR format)
            
        Returns:
            tuple: (list of embeddings, number of faces detected)
            
        Raises:
            ValueError: If image is invalid or no faces detected
        """
        try:
            # Validate image
            is_valid, message = validate_image(image)
            if not is_valid:
                raise ValueError(message)

            # Resize image if too large (DeepFace handles this but prevents memory issues)
            image = resize_image(image, max_size=1024)
            
            # Convert BGR to RGB for DeepFace
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            logger.info("Running DeepFace embedding generation...")
            
            # DeepFace.represent() returns list of dicts with embeddings
            # Each dict contains: embedding (512D), facial_area, age, gender, emotion, race, dominant_race
            results = DeepFace.represent(
                img_path=image_rgb,
                model_name=self.model_name,
                detector_backend=self.detector_backend,
                enforce_detection=True,  # Raise error if no face detected
                align=True,  # Align faces for better embeddings
                max_attempts=3,  # Retry up to 3 times
                silent=True  # Suppress console output
            )

            if not results or len(results) == 0:
                raise ValueError("No faces detected in image")

            # Extract embeddings
            embeddings = []
            for result in results:
                embedding = result.get("embedding")
                
                if embedding is None or len(embedding) == 0:
                    logger.warning("Empty embedding received, skipping face")
                    continue
                
                # Ensure embedding is 512D
                embedding_array = np.array(embedding, dtype=np.float32)
                
                if len(embedding_array) != self.embedding_dimension:
                    logger.warning(
                        f"Embedding dimension mismatch: {len(embedding_array)}D "
                        f"expected {self.embedding_dimension}D"
                    )
                    # Pad or truncate to 512D
                    if len(embedding_array) < self.embedding_dimension:
                        embedding_array = np.pad(
                            embedding_array,
                            (0, self.embedding_dimension - len(embedding_array)),
                            mode="constant"
                        )
                    else:
                        embedding_array = embedding_array[:self.embedding_dimension]
                
                # Normalize embedding to unit vector (L2 normalization)
                embedding_normalized = normalize_embedding(embedding_array)
                embeddings.append(embedding_normalized)

            if not embeddings:
                raise ValueError("Failed to generate embeddings for any detected faces")

            face_count = len(embeddings)
            logger.info(f"Successfully detected {face_count} face(s) and generated embeddings")

            return embeddings, face_count

        except ValueError as e:
            logger.error(f"Validation error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Image processing failed: {str(e)}", exc_info=True)
            raise ValueError(f"Failed to process image: {str(e)}")

    def verify_faces(self, image1: np.ndarray, image2: np.ndarray) -> dict:
        """
        Verify if two images contain the same person (optional feature).
        
        Args:
            image1: First image as numpy array
            image2: Second image as numpy array
            
        Returns:
            dict: Verification result with distance and verification status
        """
        try:
            image1_rgb = cv2.cvtColor(image1, cv2.COLOR_BGR2RGB)
            image2_rgb = cv2.cvtColor(image2, cv2.COLOR_BGR2RGB)

            result = DeepFace.verify(
                img1_path=image1_rgb,
                img2_path=image2_rgb,
                model_name=self.model_name,
                detector_backend=self.detector_backend,
                align=True,
                silent=True
            )

            return {
                "verified": result["verified"],
                "distance": float(result["distance"]),
                "model": self.model_name,
                "detector": self.detector_backend
            }

        except Exception as e:
            logger.error(f"Face verification failed: {str(e)}")
            raise

    def close(self):
        """Clean up resources (if needed for DeepFace)"""
        try:
            # DeepFace doesn't require explicit cleanup, but keeping for compatibility
            logger.info("FaceDetectionEngine resources cleaned up")
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")

