// ============================================================
// Base API Configuration
// ============================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('wondergdl_token');
  return token ? { ...defaultHeaders, Authorization: `Bearer ${token}` } : defaultHeaders;
};

// Generic fetch wrapper with error handling
const apiFetch = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      localStorage.removeItem('wondergdl_token');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

export const api = {
  get: (endpoint, params = {}) => {
    const queryString = Object.keys(params).length
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    return apiFetch(`${endpoint}${queryString}`);
  },

  post: (endpoint, body) =>
    apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: (endpoint, body) =>
    apiFetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: (endpoint, body) =>
    apiFetch(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: (endpoint) =>
    apiFetch(endpoint, { method: 'DELETE' }),
};

export default api;
