import { api } from './api';

// ============================================================
// Auth Service — WonderGDL
// Connects to: POST /auth/login, /auth/register, /auth/logout
// ============================================================

export const authService = {
  /**
   * Log in an existing user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string, user: object}>}
   */
  login: async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('wondergdl_token', data.token);
      localStorage.setItem('wondergdl_user', JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Register a new user
   * @param {object} userData - { firstName, lastName, email, password }
   * @returns {Promise<{token: string, user: object}>}
   */
  register: async (userData) => {
    const data = await api.post('/auth/register', userData);
    if (data.token) {
      localStorage.setItem('wondergdl_token', data.token);
      localStorage.setItem('wondergdl_user', JSON.stringify(data.user));
    }
    return data;
  },

  /**
   * Log out the current user
   */
  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } finally {
      localStorage.removeItem('wondergdl_token');
      localStorage.removeItem('wondergdl_user');
    }
  },

  /**
   * Get current user from local storage (no network)
   */
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('wondergdl_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('wondergdl_token');
  },

  /**
   * Update user profile
   * @param {object} profileData
   */
  updateProfile: (profileData) => api.put('/auth/profile', profileData),

  /**
   * Change password
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  /**
   * Request password reset
   * @param {string} email
   */
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  /**
   * OAuth login with Google / Apple
   * @param {string} provider - 'google' | 'apple'
   * @param {string} token - OAuth token from provider
   */
  oauthLogin: (provider, token) =>
    api.post(`/auth/oauth/${provider}`, { token }),
};

export default authService;
