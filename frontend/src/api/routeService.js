import { apiClient } from './apiClient';
import { mapRoute } from '../models/Route';

export const routeService = {
  /** landmarkIds order = the desired visiting sequence. */
  async create(userId, { name, planId, landmarkIds }) {
    const json = await apiClient.post(`/api/users/${userId}/routes`, {
      name,
      planId,
      landmarkIds,
    });
    return mapRoute(json);
  },

  async listByUser(userId) {
    const json = await apiClient.get(`/api/users/${userId}/routes`);
    return json.map(mapRoute);
  },

  /** Public browse/discovery -- routes across all users, not just one. */
  async listAll() {
    const json = await apiClient.get('/api/routes');
    return json.map(mapRoute);
  },

  async getById(id) {
    const json = await apiClient.get(`/api/routes/${id}`);
    return mapRoute(json);
  },

  async update(id, fields) {
    const json = await apiClient.put(`/api/routes/${id}`, fields);
    return mapRoute(json);
  },

  async remove(id) {
    await apiClient.del(`/api/routes/${id}`);
  },
};