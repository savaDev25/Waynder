import { describe, it, expect, afterEach } from 'vitest';
import { userService } from '../../api/userService';
import { mockFetchOnce } from '../TestUtils';

describe('userService', () => {
  afterEach(() => {
    delete global.fetch;
  });

  it('register() posts to /api/users/register and maps the response', async () => {
    mockFetchOnce({
      status: 201,
      body: { id: 'u1', name: 'Ana Torres', email: 'ana@example.com', createdAt: '2026-01-01T00:00:00Z' },
    });

    const user = await userService.register({
      name: 'Ana Torres',
      email: 'ana@example.com',
      password: 'supersecret123',
    });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/api/users/register');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      name: 'Ana Torres',
      email: 'ana@example.com',
      password: 'supersecret123',
    });

    expect(user).toEqual({
      id: 'u1',
      name: 'Ana Torres',
      email: 'ana@example.com',
      createdAt: '2026-01-01T00:00:00Z',
    });
  });

  it('getById() fetches the correct URL and maps the response', async () => {
    mockFetchOnce({
      status: 200,
      body: { id: 'u1', name: 'Ana', email: 'ana@example.com', createdAt: '2026-01-01' },
    });

    const user = await userService.getById('u1');

    expect(fetch.mock.calls[0][0]).toContain('/api/users/u1');
    expect(user.id).toBe('u1');
  });

  it('update() sends a PUT to the user-specific URL', async () => {
    mockFetchOnce({
      status: 200,
      body: { id: 'u1', name: 'New Name', email: 'ana@example.com', createdAt: '2026-01-01' },
    });

    const user = await userService.update('u1', { name: 'New Name' });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/api/users/u1');
    expect(options.method).toBe('PUT');
    expect(user.name).toBe('New Name');
  });

  it('remove() sends a DELETE request', async () => {
    mockFetchOnce({ status: 204 });

    const result = await userService.remove('u1');

    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/api/users/u1');
    expect(options.method).toBe('DELETE');
    expect(result).toBeUndefined();
  });

  it('propagates the backend error message when registration fails', async () => {
    mockFetchOnce({ status: 400, body: { message: 'Email already registered: ana@example.com' } });

    await expect(
      userService.register({ name: 'Ana', email: 'ana@example.com', password: 'supersecret123' })
    ).rejects.toThrow('Email already registered: ana@example.com');
  });
});