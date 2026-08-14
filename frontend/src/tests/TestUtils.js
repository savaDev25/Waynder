import { vi } from 'vitest';

/**
 * Stubs global.fetch to resolve with a given status/body, mimicking what
 * the backend actually returns (including its {timestamp, message} error
 * shape from GlobalExceptionHandler). Shared by every service test file.
 */
export function mockFetchOnce({ status = 200, body = null } = {}) {
  global.fetch = vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    text: async () => (body === null ? '' : JSON.stringify(body)),
  });
}