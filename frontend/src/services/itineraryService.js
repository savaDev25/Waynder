import { api } from './api';

// ============================================================
// Itinerary Service — WonderGDL
// Connects to: /itineraries endpoints
// ============================================================

export const itineraryService = {
  /**
   * Get all itineraries for the current user
   */
  getAll: () => api.get('/itineraries'),

  /**
   * Get a specific itinerary by ID
   * @param {string} id
   */
  getById: (id) => api.get(`/itineraries/${id}`),

  /**
   * Create a new itinerary
   * @param {object} data - { name, startDate, endDate, stops: [] }
   */
  create: (data) => api.post('/itineraries', data),

  /**
   * Update an itinerary
   * @param {string} id
   * @param {object} data
   */
  update: (id, data) => api.put(`/itineraries/${id}`, data),

  /**
   * Delete an itinerary
   * @param {string} id
   */
  delete: (id) => api.delete(`/itineraries/${id}`),

  /**
   * Add a stop to an itinerary
   * @param {string} itineraryId
   * @param {object} stop - { placeId, scheduledTime, duration, notes }
   */
  addStop: (itineraryId, stop) =>
    api.post(`/itineraries/${itineraryId}/stops`, stop),

  /**
   * Remove a stop from an itinerary
   * @param {string} itineraryId
   * @param {string} stopId
   */
  removeStop: (itineraryId, stopId) =>
    api.delete(`/itineraries/${itineraryId}/stops/${stopId}`),

  /**
   * Reorder stops in an itinerary
   * @param {string} itineraryId
   * @param {Array<string>} stopIds - ordered array of stop IDs
   */
  reorderStops: (itineraryId, stopIds) =>
    api.patch(`/itineraries/${itineraryId}/stops/reorder`, { stopIds }),

  /**
   * Get AI-generated itinerary based on preferences
   * @param {object} params - { duration, interests, startLocation, budget }
   */
  generateAI: (params) => api.post('/itineraries/generate', params),

  /**
   * Export itinerary
   * @param {string} id
   * @param {string} format - 'pdf' | 'ics' | 'json'
   */
  export: (id, format = 'pdf') =>
    api.get(`/itineraries/${id}/export`, { format }),

  /**
   * Share itinerary and get a shareable link
   * @param {string} id
   */
  share: (id) => api.post(`/itineraries/${id}/share`, {}),
};

export default itineraryService;
