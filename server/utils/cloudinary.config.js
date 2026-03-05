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
 * @param {string|Buffer} fileData - Base64 string (with or without prefix), data URI, or Buffer
 * @param {string} fileName - Name of the file
 * @param {string} folder - Folder path in Cloudinary
 * @returns {Promise<{publicId, imageUrl, width, height}>}
 */
export const uploadImageToCloudinary = async (fileData, fileName, folder) => {
  try {
    // If fileData is a Buffer, convert to base64
    let uploadData = fileData;
    if (Buffer.isBuffer(fileData)) {
      uploadData = `data:image/jpeg;base64,${fileData.toString("base64")}`;
    }
    // If it's a base64 string without the data prefix, add it
    else if (
      typeof fileData === "string" &&
      !fileData.startsWith("data:") &&
      !fileData.startsWith("http")
    ) {
      uploadData = `data:image/jpeg;base64,${fileData}`;
    }

    console.log(
      `Uploading to Cloudinary - fileName: ${fileName}, folder: ${folder}`,
    );

    const result = await cloudinary.uploader.upload(uploadData, {
      folder: folder || "lensifyr/events",
      resource_type: "auto",
      public_id: fileName.split(".")[0],
    });

    console.log(`Cloudinary upload successful - URL: ${result.secure_url}`);

    return {
      publicId: result.public_id,
      imageUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error(`Cloudinary upload failed:`, error);
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
