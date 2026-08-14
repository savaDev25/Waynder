import { apiClient } from './apiClient';
import { mapLandmark } from '../models/Landmark';

function toQueryString(params) {
  const usable = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (usable.length === 0) return '';
  return '?' + new URLSearchParams(Object.fromEntries(usable)).toString();
}

export const landmarkService = {
  /** Public browse/search -- not the bulk scraper ingest endpoint. */
  async search({ q, tag } = {}) {
    const query = toQueryString({ q, tag });
    const json = await apiClient.get(`/api/landmarks${query}`);
    return json.map(mapLandmark);
  },

  async getById(id) {
    const json = await apiClient.get(`/api/landmarks/${id}`);
    return mapLandmark(json);
  },

  /** Manually add a single landmark (backend marks it source="manual"). */
  async create({ name, description, address, lat, lng, imageUrl, tags }) {
    const json = await apiClient.post('/api/landmarks', {
      name,
      description,
      address,
      lat,
      lng,
      imageUrl,
      tags,
    });
    return mapLandmark(json);
  },

  async update(id, fields) {
    const json = await apiClient.put(`/api/landmarks/${id}`, fields);
    return mapLandmark(json);
  },

  async remove(id) {
    await apiClient.del(`/api/landmarks/${id}`);
  },
};