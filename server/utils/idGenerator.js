/**
 * Generate a unique ID with STD_ prefix
 * Format: STD_TIMESTAMP_RANDOM
 * @returns {string} Unique ID starting with STD_
 */
export const generateOrganizerID = () => {
  //   const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `STD_${random}`;
};
