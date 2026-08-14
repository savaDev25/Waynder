import { describe, it, expect, afterEach } from 'vitest';
import { routeService } from '../../api/routeService';
import { mockFetchOnce } from '../TestUtils';

const rawRoute = {
  id: 'r1',
  userId: 'u1',
  planId: null,
  name: 'Centro Historico',
  landmarks: [
    { landmarkId: 'l1', name: 'Templo Expiatorio', lat: 20.6, lng: -103.3, orderIndex: 0 },
    { landmarkId: 'l2', name: 'Teatro Degollado', lat: 20.67, lng: -103.34, orderIndex: 1 },
  ],
  createdAt: '2026-01-01',
};

describe('routeService', () => {
  afterEach(() => {
    delete global.fetch;
  });

  it('create() sends landmarkIds in order and maps the ordered response', async () => {
    mockFetchOnce({ status: 201, body: rawRoute });

    const route = await routeService.create('u1', {
      name: 'Centro Historico',
      landmarkIds: ['l1', 'l2'],
    });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/api/users/u1/routes');
    expect(JSON.parse(options.body).landmarkIds).toEqual(['l1', 'l2']);

    expect(route.landmarks).toHaveLength(2);
    expect(route.landmarks[0].orderIndex).toBe(0);
    expect(route.landmarks[1].orderIndex).toBe(1);
  });

  it('create() throws ApiError when a landmark id does not exist', async () => {
    mockFetchOnce({ status: 404, body: { message: 'Landmark not found: bad-id' } });

    await expect(
      routeService.create('u1', { name: 'Broken', landmarkIds: ['bad-id'] })
    ).rejects.toThrow('Landmark not found: bad-id');
  });

  it('listByUser() maps an array of routes', async () => {
    mockFetchOnce({ status: 200, body: [rawRoute] });

    const routes = await routeService.listByUser('u1');

    expect(fetch.mock.calls[0][0]).toContain('/api/users/u1/routes');
    expect(routes).toHaveLength(1);
    expect(routes[0].name).toBe('Centro Historico');
  });

  it('getById() maps a single route including its nested landmarks', async () => {
    mockFetchOnce({ status: 200, body: rawRoute });

    const route = await routeService.getById('r1');

    expect(route.landmarks[0].name).toBe('Templo Expiatorio');
  });

  it('remove() sends DELETE to /api/routes/{id}', async () => {
    mockFetchOnce({ status: 204 });

    await routeService.remove('r1');

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/api/routes/r1');
    expect(options.method).toBe('DELETE');
  });
});