import { apiClient } from './apiClient';
import { mapPlan } from '../models/Plan';

export const planService = {
  async create(userId, { name, description }) {
    const json = await apiClient.post(`/api/users/${userId}/plans`, { name, description });
    return mapPlan(json);
  },

  async listByUser(userId) {
    const json = await apiClient.get(`/api/users/${userId}/plans`);
    return json.map(mapPlan);
  },

  async getById(id) {
    const json = await apiClient.get(`/api/plans/${id}`);
    return mapPlan(json);
  },

  async update(id, fields) {
    const json = await apiClient.put(`/api/plans/${id}`, fields);
    return mapPlan(json);
  },

  async remove(id) {
    await apiClient.del(`/api/plans/${id}`);
  },
};