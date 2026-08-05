import { api } from './api';

// ============================================================
// Places Service — WonderGDL
// Connects to: /places endpoints
// ============================================================

export const placesService = {
  /**
   * Get nearby points of interest
   * @param {object} params - { lat, lng, radius, category, limit }
   */
  getNearby: (params) => api.get('/places/nearby', params),

  /**
   * Search places by query string
   * @param {string} query
   * @param {object} filters - { category, lat, lng }
   */
  search: (query, filters = {}) =>
    api.get('/places/search', { q: query, ...filters }),

  /**
   * Get place details by ID
   * @param {string} placeId
   */
  getById: (placeId) => api.get(`/places/${placeId}`),

  /**
   * Get featured / curated places
   * @param {object} params - { category, limit }
   */
  getFeatured: (params = {}) => api.get('/places/featured', params),

  /**
   * Get places by category
   * @param {string} category - 'cultural' | 'museum' | 'park' | 'dining' | 'tequila' | 'boutique' | 'landmark'
   * @param {object} params
   */
  getByCategory: (category, params = {}) =>
    api.get('/places/category', { category, ...params }),

  /**
   * Get AI-powered recommendations based on user preferences
   * @param {object} preferences - { diningType, activityPace, savedRoutes }
   */
  getRecommendations: (preferences) =>
    api.post('/places/recommendations', preferences),

  /**
   * Add a place to the user's saved trips
   * @param {string} placeId
   * @param {string} tripId
   */
  addToTrip: (placeId, tripId) =>
    api.post('/places/save', { placeId, tripId }),

  /**
   * Get all categories available
   */
  getCategories: () => api.get('/places/categories'),

  /**
   * Rate a place
   * @param {string} placeId
   * @param {number} rating - 1-5
   * @param {string} comment
   */
  ratePlace: (placeId, rating, comment) =>
    api.post(`/places/${placeId}/rating`, { rating, comment }),
};

export default placesService;
