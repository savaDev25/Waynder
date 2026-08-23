import { useState, useCallback } from 'react';
import { userService } from '../api';
import { apiClient } from '../api/apiClient';

const TOKEN_KEY = 'waynder_token';
const USER_KEY = 'waynder_user';

function readStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Real authentication -- replaces the temporary useCurrentUser stand-in.
 * Stores the JWT + user profile in localStorage (see the trade-off note in
 * apiClient.js on why Bearer-token-in-localStorage was chosen over an
 * httpOnly cookie for this project's cross-origin deployment).
 */
export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback(async (email, password) => {
    const { token: newToken, user: loggedInUser } = await apiClient.post('/api/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    setToken(newToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    // Registration doesn't issue a token by itself (backend only returns
    // the created user) -- log in immediately after so the UX is one step.
    await userService.register({ name, email, password });
    return login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return {
    token,
    user,
    userId: user?.id || null,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
  };
}