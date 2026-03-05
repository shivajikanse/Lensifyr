import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";
const PYTHON_EMBEDDING_ENDPOINT = "/api/generate-embedding";
const PYTHON_HEALTH_ENDPOINT = "/api/health";
const REQUEST_TIMEOUT = 60000; // 60 seconds

/**
 * Health check for Python microservice
 * @returns {Promise<boolean>} True if service is healthy
 */
export const checkPythonServiceHealth = async () => {
  try {
    const response = await axios.get(
      `${PYTHON_API_URL}${PYTHON_HEALTH_ENDPOINT}`,
      {
        timeout: REQUEST_TIMEOUT,
      },
    );
    return response.status === 200 && response.data.status === "healthy";
  } catch (error) {
    console.error("Python service health check failed:", error.message);
    return false;
  }
};

/**
 * Generate face embeddings from image using Python microservice
 * @param {string} imageInput - Either base64 string or URL of the image
 * @param {boolean} isBase64 - True if imageInput is base64, false if URL
 * @returns {Promise<object>} Response containing embeddings and face count
 */
export const generateFaceEmbeddings = async (imageInput, isBase64 = true) => {
  try {
    // Check if service is healthy before making request
    const isHealthy = await checkPythonServiceHealth();
    if (!isHealthy) {
      throw new Error(
        "Python face recognition service is not available. Please try again later.",
      );
    }

    const payload = isBase64
      ? { image_base64: imageInput }
      : { image_url: imageInput };

    const response = await axios.post(
      `${PYTHON_API_URL}${PYTHON_EMBEDDING_ENDPOINT}`,
      payload,
      {
        timeout: REQUEST_TIMEOUT,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // Validate response
    if (!response.data) {
      throw new Error("Empty response from face recognition service");
    }

    const { embeddings, face_count, processing_time, success } = response.data;

    if (!success) {
      throw new Error(response.data.message || "Failed to generate embeddings");
    }

    if (!embeddings || embeddings.length === 0) {
      throw new Error("No faces detected in the image");
    }

    if (!face_count) {
      throw new Error("Invalid response: face_count missing");
    }

    return {
      success: true,
      embeddings: embeddings, // Array of normalized embeddings
      faceCount: face_count,
      processingTime: processing_time || null,
      message: `Successfully detected ${face_count} face(s)`,
    };
  } catch (error) {
    // Enhanced error handling with detailed logging
    const errorMessage = error.response?.data?.message || error.message;
    const errorDetails = error.response?.data || error.response || error;

    console.error("Python API Error Details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      payload: { isBase64, inputLength: imageInput.length || 0 },
      message: errorMessage,
    });

    if (error.code === "ECONNREFUSED") {
      throw new Error(
        "Cannot connect to face recognition service. Make sure it's running on " +
          PYTHON_API_URL,
      );
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("Face recognition service request timeout");
    }

    throw new Error(`Face recognition error: ${errorMessage}`);
  }
};

/**
 * Generate embeddings from base64 image
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<object>} Embeddings response
 */
export const generateEmbeddingsFromBase64 = async (base64Image) => {
  // Validate base64
  if (!base64Image || typeof base64Image !== "string") {
    throw new Error("Invalid base64 image");
  }

  return generateFaceEmbeddings(base64Image, true);
};

/**
 * Generate embeddings from image URL
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<object>} Embeddings response
 */
export const generateEmbeddingsFromUrl = async (imageUrl) => {
  // Validate URL
  if (!imageUrl || !isValidUrl(imageUrl)) {
    throw new Error("Invalid image URL");
  }

  return generateFaceEmbeddings(imageUrl, false);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Batch process multiple images
 * @param {Array} imageInputs - Array of image base64 or URLs
 * @param {boolean} isBase64 - True if inputs are base64
 * @returns {Promise<Array>} Array of embedding results
 */
export const batchGenerateEmbeddings = async (imageInputs, isBase64 = true) => {
  if (!Array.isArray(imageInputs) || imageInputs.length === 0) {
    throw new Error("Invalid image inputs");
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < imageInputs.length; i++) {
    try {
      const result = await generateFaceEmbeddings(imageInputs[i], isBase64);
      results.push({
        index: i,
        success: true,
        ...result,
      });
    } catch (error) {
      errors.push({
        index: i,
        success: false,
        error: error.message,
      });
      results.push({
        index: i,
        success: false,
        error: error.message,
      });
    }
  }

  return {
    results,
    successCount: results.filter((r) => r.success).length,
    errorCount: results.filter((r) => !r.success).length,
    hasErrors: errors.length > 0,
  };
};

/**
 * Verify Python service configuration
 * @returns {Promise<object>} Service info and status
 */
export const getServiceInfo = async () => {
  try {
    const response = await axios.get(`${PYTHON_API_URL}/api/info`, {
      timeout: REQUEST_TIMEOUT,
    });

    return {
      success: true,
      apiUrl: PYTHON_API_URL,
      ...response.data,
    };
  } catch (error) {
    return {
      success: false,
      apiUrl: PYTHON_API_URL,
      error: error.message,
    };
  }
};
