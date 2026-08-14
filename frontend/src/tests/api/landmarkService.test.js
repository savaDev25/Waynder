import { describe, it, expect, afterEach } from 'vitest';
import { landmarkService } from '../../api/landmarkService';
import { mockFetchOnce } from '../TestUtils';

const rawLandmark = {
  id: 'l1',
  name: 'Templo Expiatorio',
  description: null,
  address: null,
  lat: 20.6712,
  lng: -103.3617,
  imageUrl: null,
  popularityScore: 0,
  tags: ['historical'],
};

describe('landmarkService', () => {
  afterEach(() => {
    delete global.fetch;
  });

  it('search() with no filters hits /api/landmarks with no query string', async () => {
    mockFetchOnce({ status: 200, body: [rawLandmark] });

    const results = await landmarkService.search();

    expect(fetch.mock.calls[0][0]).toMatch(/\/api\/landmarks$/);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Templo Expiatorio');
  });

  it('search() includes tag and q as query params when provided', async () => {
    mockFetchOnce({ status: 200, body: [] });

    await landmarkService.search({ tag: 'historical', q: 'templo' });

    const url = fetch.mock.calls[0][0];
    expect(url).toContain('tag=historical');
    expect(url).toContain('q=templo');
  });

  it('search() omits empty or undefined filters from the query string', async () => {
    mockFetchOnce({ status: 200, body: [] });

    await landmarkService.search({ tag: '', q: undefined });

    expect(fetch.mock.calls[0][0]).not.toContain('tag=');
    expect(fetch.mock.calls[0][0]).not.toContain('q=');
  });

  it('getById() maps a single landmark response, defaulting nullable fields', async () => {
    mockFetchOnce({ status: 200, body: rawLandmark });

    const landmark = await landmarkService.getById('l1');

    expect(landmark.lat).toBe(20.6712);
    expect(landmark.tags).toEqual(['historical']);
    expect(landmark.description).toBeNull();
  });

  it('getById() throws ApiError with the backend message on 404', async () => {
    mockFetchOnce({ status: 404, body: { message: 'Landmark not found: l1' } });

    await expect(landmarkService.getById('l1')).rejects.toThrow('Landmark not found: l1');
  });

  it('create() posts to /api/landmarks and maps the created landmark', async () => {
    mockFetchOnce({ status: 201, body: rawLandmark });

    const landmark = await landmarkService.create({
      name: 'Templo Expiatorio',
      lat: 20.6712,
      lng: -103.3617,
      tags: ['historical'],
    });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/api/landmarks');
    expect(options.method).toBe('POST');
    expect(landmark.id).toBe('l1');
  });

  it('remove() sends DELETE to /api/landmarks/{id}', async () => {
    mockFetchOnce({ status: 204 });

    await landmarkService.remove('l1');

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/api/landmarks/l1');
    expect(options.method).toBe('DELETE');
  });
});