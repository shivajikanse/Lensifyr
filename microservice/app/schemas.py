from pydantic import BaseModel, Field
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

    def model_validate_values(self):
        """Ensure at least one of image_base64 or image_url is provided"""
        if not self.image_base64 and not self.image_url:
            raise ValueError(
                "Either image_base64 or image_url must be provided"
            )
        if self.image_base64 and self.image_url:
            raise ValueError("Please provide only one of image_base64 or image_url")


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
