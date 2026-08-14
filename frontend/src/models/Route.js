/**
 * @typedef {Object} RouteLandmark
 * @property {string} landmarkId
 * @property {string} name
 * @property {number} lat
 * @property {number} lng
 * @property {number} orderIndex - position in the visiting sequence
 */

/**
 * @typedef {Object} Route
 * @property {string} id
 * @property {string} userId
 * @property {string|null} planId
 * @property {string} name
 * @property {RouteLandmark[]} landmarks - already sorted by orderIndex
 * @property {string} createdAt
 */

export function mapRoute(json) {
  return {
    id: json.id,
    userId: json.userId,
    planId: json.planId ?? null,
    name: json.name,
    landmarks: (json.landmarks ?? []).map((l) => ({
      landmarkId: l.landmarkId,
      name: l.name,
      lat: l.lat,
      lng: l.lng,
      orderIndex: l.orderIndex,
    })),
    createdAt: json.createdAt,
  };
}