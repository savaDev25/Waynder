import { describe, it, expect, afterEach, vi } from 'vitest';
import { recommendationService } from '../../api/recommendationService';
import { mockFetchOnce } from '../TestUtils';

const rawRecommendation = {
  id: 'l2',
  name: 'Bosque Los Colomos',
  description: null,
  address: null,
  lat: 20.6932,
  lng: -103.3947,
  imageUrl: null,
  tags: ['nature'],
  reason: 'Pairs well with restaurant',
  distanceKm: 3.4,
};

describe('recommendationService', () => {
  afterEach(() => {
    delete global.fetch;
  });

  it('recommendLandmarks() returns an empty array without calling fetch when basedOnIds is empty', async () => {
    global.fetch = vi.fn();

    const result = await recommendationService.recommendLandmarks([]);

    expect(result).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('recommendLandmarks() returns an empty array without calling fetch when basedOnIds is undefined', async () => {
    global.fetch = vi.fn();

    const result = await recommendationService.recommendLandmarks(undefined);

    expect(result).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('recommendLandmarks() sends one basedOn param per id, plus the default limit', async () => {
    mockFetchOnce({ status: 200, body: [rawRecommendation] });

    await recommendationService.recommendLandmarks(['l1', 'l3']);

    const url = fetch.mock.calls[0][0];
    const params = new URL(url, 'http://localhost').searchParams;

    expect(params.getAll('basedOn')).toEqual(['l1', 'l3']);
    expect(params.get('limit')).toBe('5'); // default when not provided
  });

  it('recommendLandmarks() uses a custom limit when provided', async () => {
    mockFetchOnce({ status: 200, body: [] });

    await recommendationService.recommendLandmarks(['l1'], 2);

    const url = fetch.mock.calls[0][0];
    const params = new URL(url, 'http://localhost').searchParams;

    expect(params.get('limit')).toBe('2');
  });

  it('recommendLandmarks() maps landmark fields plus reason/distanceKm', async () => {
    mockFetchOnce({ status: 200, body: [rawRecommendation] });

    const result = await recommendationService.recommendLandmarks(['l1']);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'l2',
      name: 'Bosque Los Colomos',
      tags: ['nature'],
      reason: 'Pairs well with restaurant',
      distanceKm: 3.4,
    });
  });

  it('recommendLandmarks() propagates ApiError on a failed request', async () => {
    mockFetchOnce({ status: 500, body: { message: 'Internal error' } });

    await expect(recommendationService.recommendLandmarks(['l1'])).rejects.toThrow('Internal error');
  });
});