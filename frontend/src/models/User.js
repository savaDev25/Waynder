/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} createdAt - ISO timestamp
 */

/** Normalizes a raw API response into a consistent shape. */
export function mapUser(json) {
  return {
    id: json.id,
    name: json.name,
    email: json.email,
    createdAt: json.createdAt,
  };
}