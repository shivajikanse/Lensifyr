import base64
import io
import time
import numpy as np
import requests
from PIL import Image
import cv2

def decode_base64_image(image_base64: str):
    """
    Decode base64 encoded image to numpy array
    
    Args:
        image_base64: Base64 encoded image string
        
    Returns:
        numpy array: Image as numpy array (BGR format for OpenCV)
    """
    try:
        # Remove data URL prefix if exists
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        
        # Decode base64
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to numpy array and BGR format
        image_array = np.array(image)
        
        # Convert RGB to BGR if needed
        if len(image_array.shape) == 3 and image_array.shape[2] == 3:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        
        return image_array
    except Exception as e:
        raise ValueError(f"Failed to decode base64 image: {str(e)}")


def load_image_from_url(image_url: str):
    """
    Load image from URL
    
    Args:
        image_url: URL of the image
        
    Returns:
        numpy array: Image as numpy array (BGR format)
    """
    try:
        # Make request with proper headers and SSL verification
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        response = requests.get(image_url, timeout=30, headers=headers, stream=True)
        response.raise_for_status()
        
        # Read content and open image
        image = Image.open(io.BytesIO(response.content))
        image_array = np.array(image)
        
        # Convert RGB to BGR if needed
        if len(image_array.shape) == 3 and image_array.shape[2] == 3:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        
        return image_array
    except requests.exceptions.ConnectionError as e:
        raise ValueError(f"Failed to connect to image URL: {str(e)}")
    except requests.exceptions.Timeout as e:
        raise ValueError(f"Request to image URL timed out: {str(e)}")
    except requests.exceptions.HTTPError as e:
        raise ValueError(f"HTTP error loading image: {str(e)}")
    except Exception as e:
        raise ValueError(f"Failed to load image from URL: {str(e)}")


def normalize_embedding(embedding: np.ndarray) -> list:
    """
    Normalize embedding vector to unit length
    
    Args:
        embedding: Embedding vector as numpy array
        
    Returns:
        list: Normalized embedding as list
    """
    try:
        embedding = np.array(embedding, dtype=np.float32)
        norm = np.linalg.norm(embedding)
        
        if norm == 0:
            return embedding.tolist()
        
        normalized = embedding / norm
        return normalized.tolist()
    except Exception as e:
        raise ValueError(f"Failed to normalize embedding: {str(e)}")


def validate_image(image: np.ndarray) -> tuple[bool, str]:
    """
    Validate image dimensions and format
    
    Args:
        image: Image as numpy array
        
    Returns:
        tuple: (is_valid, message)
    """
    try:
        if image is None or image.size == 0:
            return False, "Invalid image data"
        
        if len(image.shape) < 2:
            return False, "Image must be 2D or 3D array"
        
        height, width = image.shape[:2]
        
        # Check minimum dimensions
        if height < 10 or width < 10:
            return False, "Image is too small (minimum 10x10 pixels)"
        
        # Check maximum dimensions
        if height > 4096 or width > 4096:
            return False, "Image is too large (maximum 4096x4096 pixels)"
        
        return True, "Image is valid"
    except Exception as e:
        return False, f"Image validation failed: {str(e)}"


def get_face_bounding_box(face_landmarks) -> dict:
    """
    Get bounding box from face landmarks
    
    Args:
        face_landmarks: Face landmarks from MediaPipe
        
    Returns:
        dict: Bounding box coordinates {x_min, y_min, x_max, y_max}
    """
    if not face_landmarks or len(face_landmarks.landmark) == 0:
        return None
    
    landmarks = face_landmarks.landmark
    
    x_coords = [lm.x for lm in landmarks]
    y_coords = [lm.y for lm in landmarks]
    
    return {
        "x_min": min(x_coords),
        "y_min": min(y_coords),
        "x_max": max(x_coords),
        "y_max": max(y_coords),
    }


def resize_image(image: np.ndarray, max_size: int = 1024) -> np.ndarray:
    """
    Resize image if it exceeds max size while maintaining aspect ratio
    
    Args:
        image: Input image as numpy array
        max_size: Maximum width or height in pixels
        
    Returns:
        numpy array: Resized image
    """
    print('image shape:',image.shape)
    height, width = image.shape[:2]
    
    if height <= max_size and width <= max_size:
        return image
    
    # Calculate scaling factor
    scale = min(max_size / height, max_size / width)
    new_height = int(height * scale)
    new_width = int(width * scale)
    
    # Resize image
    resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
    
    return resized


def measure_time(func):
    """Decorator to measure function execution time"""
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        execution_time = (end_time - start_time) * 1000  # Convert to milliseconds
        return result, execution_time
    return wrapper


def validate_embedding_vector(embedding: list, expected_dim: int = 512) -> tuple[bool, str]:
    """
    Validate that an embedding is a list of floats with correct dimension
    
    Args:
        embedding: Embedding vector to validate
        expected_dim: Expected dimension (default 512)
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not isinstance(embedding, list):
        return False, f"Embedding must be a list, got {type(embedding).__name__}"
    
    if len(embedding) != expected_dim:
        return False, f"Embedding dimension must be {expected_dim}, got {len(embedding)}"
    
    try:
        # Try to convert to float array and check all values are numbers
        embedding_array = np.array(embedding, dtype=np.float32)
        if not np.all(np.isfinite(embedding_array)):
            return False, "Embedding contains NaN or infinite values"
        return True, "Valid"
    except (ValueError, TypeError) as e:
        return False, f"Embedding contains non-numeric values: {str(e)}"


def validate_event_embeddings(event_embeddings: list) -> tuple[bool, str]:
    """
    Validate event embeddings format
    
    Args:
        event_embeddings: List of EventEmbeddingItem (Pydantic models) or {id, embedding} dicts
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not isinstance(event_embeddings, list):
        return False, f"event_embeddings must be a list, got {type(event_embeddings).__name__}"
    
    if len(event_embeddings) == 0:
        return False, "event_embeddings cannot be empty"
    
    for i, item in enumerate(event_embeddings):
        # Handle both Pydantic models and dicts
        # Pydantic models have attributes, dicts have keys
        if isinstance(item, dict):
            # Legacy dict support
            if "id" not in item or "embedding" not in item:
                return False, f"Item {i} missing 'id' or 'embedding' field"
            
            if not isinstance(item["id"], str):
                return False, f"Item {i} 'id' must be a string, got {type(item['id']).__name__}"
            
            item_id = item["id"]
            item_embedding = item["embedding"]
        else:
            # Pydantic model (EventEmbeddingItem)
            if not hasattr(item, 'id') or not hasattr(item, 'embedding'):
                return False, f"Item {i} missing 'id' or 'embedding' attribute"
            
            if not isinstance(item.id, str):
                return False, f"Item {i} 'id' must be a string, got {type(item.id).__name__}"
            
            item_id = item.id
            item_embedding = item.embedding
        
        is_valid, msg = validate_embedding_vector(item_embedding)
        if not is_valid:
            return False, f"Item {i} embedding invalid: {msg}"
    
    return True, "Valid"


def compute_cosine_similarity_vectorized(selfie_embedding: list, event_embeddings: list) -> list:
    """
    Compute cosine similarity between selfie and all event embeddings using NumPy vectorization
    
    Args:
        selfie_embedding: 512D embedding from user's selfie (list)
        event_embeddings: List of {id: string, embedding: list[512]} dicts or EventEmbeddingItem Pydantic models
        
    Returns:
        list: List of {id, score} sorted by score descending
    """
    # Convert to numpy arrays - handle both dict and Pydantic model objects
    selfie_emb = np.array(selfie_embedding, dtype=np.float32)
    
    # Extract embeddings and IDs, handling both dict and Pydantic model objects
    event_embeddings_list = []
    image_ids = []
    for item in event_embeddings:
        if isinstance(item, dict):
            event_embeddings_list.append(item["embedding"])
            image_ids.append(item["id"])
        else:  # Pydantic model object
            event_embeddings_list.append(item.embedding)
            image_ids.append(item.id)
    
    event_embs = np.array(event_embeddings_list, dtype=np.float32)
    
    # Normalize embeddings (L2 normalization)
    # Since embeddings are already normalized from the generation phase, this is mostly for safety
    selfie_norm = np.linalg.norm(selfie_emb)
    if selfie_norm > 0:
        selfie_emb = selfie_emb / selfie_norm
    
    event_norms = np.linalg.norm(event_embs, axis=1, keepdims=True)
    event_embs = np.divide(event_embs, event_norms, where=event_norms!=0, out=event_embs)
    
    # Vectorized cosine similarity (dot product of normalized vectors)
    # Shape: (512,) · (N, 512)^T = (N,)
    scores = np.dot(event_embs, selfie_emb)
    
    # Convert to 0-1 range (cosine similarity is in [-1, 1] due to normalization, but typically [0, 1])
    # Clamp to [0, 1] for safety
    scores = np.clip(scores, 0, 1)
    
    # Create results with image IDs
    results = [
        {"id": image_ids[i], "score": float(scores[i])}
        for i in range(len(image_ids))
    ]
    
    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    
    return results
