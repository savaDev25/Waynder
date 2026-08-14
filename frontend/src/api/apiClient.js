// Central place all API calls go through -- base URL, JSON handling, and
// error shape all live here so individual services stay short.

// Assumes Vite (import.meta.env.VITE_API_BASE_URL). If you're on Create
// React App instead, swap this line for:
//   const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // DELETE endpoints return 204 No Content -- nothing to parse
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    // Matches the backend's GlobalExceptionHandler shape: { timestamp, message }
    const message = data?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};