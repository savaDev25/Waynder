import { api } from './api';

// ============================================================
// Routes Service — WonderGDL
// Connects to: /routes endpoints
// ============================================================

export const routesService = {
  /**
   * Generate a route between origin and destination
   * @param {object} params - { origin, destination, mode, preferences }
   * @returns {Promise<{route: object, steps: array, duration: number}>}
   */
  generateRoute: (params) => api.post('/routes/generate', params),

  /**
   * Get all saved routes for the current user
   * @returns {Promise<Array>}
   */
  getSavedRoutes: () => api.get('/routes/saved'),

  /**
   * Save a route
   * @param {object} routeData - { name, origin, destination, mode, waypoints }
   */
  saveRoute: (routeData) => api.post('/routes/saved', routeData),

  /**
   * Delete a saved route
   * @param {string} routeId
   */
  deleteRoute: (routeId) => api.delete(`/routes/saved/${routeId}`),

  /**
   * Get a specific saved route by ID
   * @param {string} routeId
   */
  getRouteById: (routeId) => api.get(`/routes/saved/${routeId}`),

  /**
   * Get real-time alerts for a route
   * @param {string} routeId
   */
  getRouteAlerts: (routeId) => api.get(`/routes/${routeId}/alerts`),

  /**
   * Get available transport modes for a given corridor
   * @param {object} params - { lat, lng }
   */
  getTransportModes: (params) => api.get('/routes/transport-modes', params),

  /**
   * Calculate multi-stop itinerary
   * @param {object} params - { stops: [], mode, date }
   */
  generateItinerary: (params) => api.post('/routes/itinerary', params),

  /**
   * Export route to shareable format
   * @param {string} routeId
   * @param {string} format - 'pdf' | 'json' | 'gpx'
   */
  exportRoute: (routeId, format = 'pdf') =>
    api.get(`/routes/saved/${routeId}/export`, { format }),
};

export default routesService;
