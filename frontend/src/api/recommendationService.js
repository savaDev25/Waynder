import { apiClient } from './apiClient';
import { mapLandmark } from '../models/Landmark';

export const recommendationService = {
  /** basedOnIds: landmark ids already selected (in a route/day being built). */
  async recommendLandmarks(basedOnIds, limit = 5) {
    if (!basedOnIds || basedOnIds.length === 0) {
      return [];
    }
    const params = new URLSearchParams();
    basedOnIds.forEach((id) => params.append('basedOn', id));
    params.set('limit', limit);

    const json = await apiClient.get(`/api/recommendations/landmarks?${params.toString()}`);
    // Each result is a landmark shape plus `reason`/`distanceKm` -- map the
    // landmark fields, then carry the two extra fields through untouched.
    return json.map((r) => ({ ...mapLandmark(r), reason: r.reason, distanceKm: r.distanceKm }));
  },
};