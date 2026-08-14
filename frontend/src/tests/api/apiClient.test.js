import { describe, it, expect, afterEach } from 'vitest';
import { apiClient, ApiError } from '../../api/apiClient';
import { mockFetchOnce } from '../TestUtils';

describe('apiClient', () => {
  afterEach(() => {
    delete global.fetch;
  });

  it('sends GET requests with a JSON content-type header', async () => {
    mockFetchOnce({ status: 200, body: { id: '1' } });

    await apiClient.get('/api/landmarks/1');

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/api/landmarks/1');
    expect(options.method).toBe('GET');
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('sends POST requests with a JSON-stringified body', async () => {
    mockFetchOnce({ status: 201, body: { id: '1', name: 'Test' } });

    await apiClient.post('/api/landmarks', { name: 'Test' });

    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.body).toBe(JSON.stringify({ name: 'Test' }));
  });

  it('parses and returns JSON response bodies', async () => {
    mockFetchOnce({ status: 200, body: { id: '1', name: 'Templo Expiatorio' } });

    const result = await apiClient.get('/api/landmarks/1');

    expect(result).toEqual({ id: '1', name: 'Templo Expiatorio' });
  });

  it('returns null for 204 No Content responses without parsing', async () => {
    mockFetchOnce({ status: 204, body: null });

    const result = await apiClient.del('/api/landmarks/1');

    expect(result).toBeNull();
  });

  it('throws ApiError using the backend-provided message on non-2xx responses', async () => {
    mockFetchOnce({ status: 404, body: { message: 'Landmark not found: 1', timestamp: '2026-01-01' } });

    await expect(apiClient.get('/api/landmarks/1')).rejects.toThrow(ApiError);
    await expect(apiClient.get('/api/landmarks/1')).rejects.toThrow('Landmark not found: 1');
  });

  it('falls back to a generic message when the error body has none', async () => {
    mockFetchOnce({ status: 500, body: null });

    await expect(apiClient.get('/api/landmarks/1')).rejects.toThrow(/500/);
  });

  it('attaches the HTTP status code to thrown ApiErrors', async () => {
    mockFetchOnce({ status: 400, body: { message: 'Bad input' } });

    await expect(apiClient.get('/api/landmarks/1')).rejects.toMatchObject({ status: 400 });
  });
});