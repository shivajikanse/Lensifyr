import archiver from "archiver";
import fs from "fs";
import path from "path";
import axios from "axios";
import { createWriteStream } from "fs";
import { dirname } from "path";

/**
 * Validate image file
 * @param {object} file - Express file object or file metadata
 * @param {number} maxSize - Max file size in bytes (default 5MB)
 * @returns {object} Validation result with isValid and error properties
 */
export const validateImageFile = (file, maxSize = 5 * 1024 * 1024) => {
  if (!file) {
    return { isValid: false, error: "No file provided" };
  }

  // Check file size
  if (file.size && file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${maxSizeMB}MB`,
    };
  }

  // Check mime type
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
  ];
  if (file.mimetype && !allowedMimeTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`,
    };
  }

  // Check file extension
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const fileExtension = path.extname(file.name || file.originalname || "");
  if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
    return {
      isValid: false,
      error: `Invalid file extension. Allowed types: ${allowedExtensions.join(", ")}`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Generate ZIP file from matched images
 * @param {Array} matches - Array of matched image objects with imageUrl and imageName
 * @param {string} outputPath - Path where ZIP file should be saved
 * @returns {Promise<string>} Path to the created ZIP file
 */
export const generateZipFromImages = async (matches, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure directory exists
      const dir = dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create a write stream for the ZIP file
      const output = createWriteStream(outputPath);

      // Create archiver instance
      const archive = archiver("zip", { zlib: { level: 9 } }); // 9 = maximum compression

      // Handle archive events
      archive.on("error", (err) => {
        reject(new Error(`Archive error: ${err.message}`));
      });

      output.on("error", (err) => {
        reject(new Error(`Output stream error: ${err.message}`));
      });

      output.on("close", () => {
        resolve(outputPath);
      });

      // Pipe archive to output
      archive.pipe(output);

      // Add images to archive
      const addImagesToArchive = async () => {
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];

          try {
            // Download image from Cloudinary URL
            const imageResponse = await axios.get(match.imageUrl, {
              responseType: "arraybuffer",
              timeout: 30000, // 30 seconds timeout
            });

            // Create a filename for the image
            const fileName = `matched_${i + 1}_${match.similarity.toFixed(2)}.jpg`;

            // Add image to archive
            archive.append(imageResponse.data, { name: fileName });
          } catch (error) {
            console.error(`Failed to download image: ${match.imageUrl}`, error);
            // Continue with other images even if one fails
          }
        }

        // Finalize the archive
        await archive.finalize();
      };

      addImagesToArchive().catch((error) => {
        reject(error);
      });
    } catch (error) {
      reject(new Error(`ZIP generation failed: ${error.message}`));
    }
  });
};

/**
 * Clean up temporary files
 * @param {string} filePath - Path to file to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      resolve();
      return;
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        reject(new Error(`Failed to delete file: ${err.message}`));
      } else {
        resolve();
      }
    });
  });
};

/**
 * Get file size in readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Readable file size
 */
export const getReadableFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
