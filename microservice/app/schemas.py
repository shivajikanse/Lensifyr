from pydantic import BaseModel, Field, model_validator
from typing import List, Optional

class EmbeddingRequest(BaseModel):
    """Request model for generating embeddings"""
    image_base64: Optional[str] = Field(
        None, description="Base64 encoded image"
    )
    image_url: Optional[str] = Field(None, description="URL of the image")

    class Config:
        json_schema_extra = {
            "example": {
                "image_base64": "iVBORw0KGgoAAAANSUhEUgAAAAUA..."
            }
        }

    @model_validator(mode='after')
    def validate_at_least_one(self):
        """Ensure at least one of image_base64 or image_url is provided"""
        if not self.image_base64 and not self.image_url:
            raise ValueError("Either image_base64 or image_url must be provided")
        if self.image_base64 and self.image_url:
            raise ValueError("Please provide only one of image_base64 or image_url")
        return self


class EmbeddingResponse(BaseModel):
    """Response model for embedding generation"""
    success: bool = Field(True, description="Whether the operation was successful")
    embeddings: List[List[float]] = Field(
        ..., description="List of face embeddings (each embedding is 512D vector)"
    )
    face_count: int = Field(..., description="Number of faces detected")
    processing_time: Optional[float] = Field(
        None, description="Time taken to process the image in milliseconds"
    )
    message: str = Field(..., description="Status message")


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str = Field("healthy", description="Service status")
    service: str = Field("Lensifyr Face Recognition Engine", description="Service name")
    version: str = Field("1.0.0", description="Service version")


class ServiceInfoResponse(BaseModel):
    """Service information response"""
    service: str = Field("Lensifyr Face Recognition Engine")
    version: str = Field("1.0.0")
    embedding_dimension: int = Field(512, description="Dimension of face embeddings")
    supported_formats: List[str] = Field(
        ["JPEG", "PNG", "WebP"], description="Supported image formats"
    )
    max_file_size_mb: int = Field(5, description="Maximum file size in MB")


class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = Field(False)
    message: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Error code")


class EventEmbeddingItem(BaseModel):
    """Individual event embedding item"""
    id: str = Field(..., description="Image ID from MongoDB")
    embedding: List[float] = Field(..., description="512D face embedding vector")


class FindMatchesRequest(BaseModel):
    """Request model for finding matching faces"""
    selfie_embedding: List[float] = Field(
        ..., description="512D embedding from user's selfie"
    )
    event_embeddings: List[EventEmbeddingItem] = Field(
        ..., description="List of embeddings for all event images"
    )
    threshold: float = Field(
        0.4, ge=0, le=1, description="Similarity threshold (0-1)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "selfie_embedding": [0.123, 0.456, -0.789],  # 512 floats in reality
                "event_embeddings": [
                    {"id": "image_id_1", "embedding": [0.100, 0.200, -0.300]},
                    {"id": "image_id_2", "embedding": [0.150, 0.250, -0.350]},
                ],
                "threshold": 0.5
            }
        }


class MatchResult(BaseModel):
    """Single match result"""
    id: str = Field(..., description="Image ID from MongoDB")
    score: float = Field(..., description="Cosine similarity score (0-1)")


class FindMatchesResponse(BaseModel):
    """Response model for finding matches"""
    success: bool = Field(True, description="Whether the operation was successful")
    matches: List[MatchResult] = Field(
        ..., description="List of matching images sorted by score (descending)"
    )
    match_count: int = Field(..., description="Number of matches found")
    processing_time: Optional[float] = Field(
        None, description="Time taken to compute similarities in milliseconds"
    )
    message: str = Field(..., description="Status message")
