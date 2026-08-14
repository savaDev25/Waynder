import { apiClient } from './apiClient';
import { mapUser } from '../models/User';

export const userService = {
  async register({ name, email, password }) {
    const json = await apiClient.post('/api/users/register', { name, email, password });
    return mapUser(json);
  },

  async getById(id) {
    const json = await apiClient.get(`/api/users/${id}`);
    return mapUser(json);
  },

  async update(id, { name, email }) {
    const json = await apiClient.put(`/api/users/${id}`, { name, email });
    return mapUser(json);
  },

  async remove(id) {
    await apiClient.del(`/api/users/${id}`);
  },
};