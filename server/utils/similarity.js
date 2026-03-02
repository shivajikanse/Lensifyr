/**
 * Calculate cosine similarity between two embedding vectors
 * @param {number[]} embedding1 - First embedding vector
 * @param {number[]} embedding2 - Second embedding vector
 * @returns {number} Cosine similarity score (0 to 1)
 */
export const cosineSimilarity = (embedding1, embedding2) => {
  if (
    !embedding1 ||
    !embedding2 ||
    embedding1.length !== embedding2.length ||
    embedding1.length === 0
  ) {
    throw new Error("Invalid embeddings for similarity calculation");
  }

  // Dot product
  let dotProduct = 0;
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
  }

  // Magnitude of embedding1
  let magnitude1 = 0;
  for (let i = 0; i < embedding1.length; i++) {
    magnitude1 += embedding1[i] * embedding1[i];
  }
  magnitude1 = Math.sqrt(magnitude1);

  // Magnitude of embedding2
  let magnitude2 = 0;
  for (let i = 0; i < embedding2.length; i++) {
    magnitude2 += embedding2[i] * embedding2[i];
  }
  magnitude2 = Math.sqrt(magnitude2);

  // Avoid division by zero
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
};

/**
 * Calculate magnitude (norm) of a vector for normalization
 * @param {number[]} vector - Input vector
 * @returns {number} Magnitude of the vector
 */
export const calculateMagnitude = (vector) => {
  if (!vector || vector.length === 0) {
    throw new Error("Invalid vector for magnitude calculation");
  }

  let sumOfSquares = 0;
  for (let i = 0; i < vector.length; i++) {
    sumOfSquares += vector[i] * vector[i];
  }

  return Math.sqrt(sumOfSquares);
};

/**
 * Find best matches using cosine similarity
 * @param {number[]} userEmbedding - User's embedding
 * @param {Array} imageDocuments - Array of image documents from MongoDB
 * @param {number} threshold - Similarity threshold (default 0.6)
 * @returns {Array} Array of matched images with similarity scores, sorted by score
 */
export const findSimilarImages = (
  userEmbedding,
  imageDocuments,
  threshold = 0.6,
) => {
  if (!userEmbedding || userEmbedding.length === 0) {
    throw new Error("Invalid user embedding");
  }

  if (!Array.isArray(imageDocuments)) {
    throw new Error("Invalid image documents");
  }

  const matches = [];

  imageDocuments.forEach((imageDoc) => {
    if (!imageDoc.faceEmbeddings || imageDoc.faceEmbeddings.length === 0) {
      return;
    }

    // Check each face embedding in the image
    imageDoc.faceEmbeddings.forEach((faceEmbedding, faceIndex) => {
      const similarity = cosineSimilarity(userEmbedding, faceEmbedding);

      if (similarity >= threshold) {
        matches.push({
          imageId: imageDoc._id,
          eventId: imageDoc.event,
          imageUrl: imageDoc.imageUrl,
          publicId: imageDoc.publicId,
          faceIndex: faceIndex,
          similarity: parseFloat(similarity.toFixed(4)), // Round to 4 decimal places
          uploadedAt: imageDoc.createdAt,
        });
      }
    });
  });

  // Sort by similarity score in descending order
  matches.sort((a, b) => b.similarity - a.similarity);

  return matches;
};

/**
 * Batch find similarities for multiple embeddings
 * @param {number[][]} embeddings - Array of embedding vectors
 * @param {Array} imageDocuments - Array of image documents from MongoDB
 * @param {number} threshold - Similarity threshold
 * @returns {Array} Array of all matches with best match highlighted
 */
export const findSimilarImagesForMultipleFaces = (
  embeddings,
  imageDocuments,
  threshold = 0.6,
) => {
  if (!Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error("Invalid embeddings array");
  }

  const allMatches = [];

  embeddings.forEach((embedding, index) => {
    const matches = findSimilarImages(embedding, imageDocuments, threshold);
    allMatches.push({
      faceIndex: index,
      matches: matches,
      matchCount: matches.length,
    });
  });

  return allMatches;
};
