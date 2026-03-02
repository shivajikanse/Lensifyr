import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {string} fileData - Base64 or file path of image
 * @param {string} fileName - Name of the file
 * @param {string} folder - Folder path in Cloudinary
 * @returns {Promise<{publicId, imageUrl, width, height}>}
 */
export const uploadImageToCloudinary = async (fileData, fileName, folder) => {
  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder: folder || "lensifyr/events",
      resource_type: "auto",
      public_id: fileName.split(".")[0],
    });

    return {
      publicId: result.public_id,
      imageUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<void>}
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

/**
 * Get image URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {object} transformations - Cloudinary transformations
 * @returns {string} Transformed image URL
 */
export const getCloudinaryUrl = (publicId, transformations = {}) => {
  try {
    return cloudinary.url(publicId, {
      quality: "auto",
      fetch_format: "auto",
      ...transformations,
    });
  } catch (error) {
    throw new Error(`Failed to generate Cloudinary URL: ${error.message}`);
  }
};

export default cloudinary;
