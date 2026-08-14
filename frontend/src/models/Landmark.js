/**
 * @typedef {Object} Landmark
 * @property {string} id
 * @property {string} name
 * @property {string|null} description
 * @property {string|null} address - display-only, never used for math
 * @property {number} lat
 * @property {number} lng
 * @property {string|null} imageUrl
 * @property {number} popularityScore
 * @property {string[]} tags
 */

export function mapLandmark(json) {
  return {
    id: json.id,
    name: json.name,
    description: json.description ?? null,
    address: json.address ?? null,
    lat: json.lat,
    lng: json.lng,
    imageUrl: json.imageUrl ?? null,
    popularityScore: json.popularityScore ?? 0,
    tags: json.tags ?? [],
  };
}