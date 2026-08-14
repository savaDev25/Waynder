/**
 * @typedef {Object} Plan
 * @property {string} id
 * @property {string} userId
 * @property {string} name
 * @property {string|null} description
 * @property {string} createdAt
 */

export function mapPlan(json) {
  return {
    id: json.id,
    userId: json.userId,
    name: json.name,
    description: json.description ?? null,
    createdAt: json.createdAt,
  };
}