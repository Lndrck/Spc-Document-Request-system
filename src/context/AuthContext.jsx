import React, { createContext, useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * AuthContext: Manages global authentication state
 * Provides user info, login/logout, and protected route checks
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // On mount, check if user is still logged in (via /auth/me endpoint)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user || response.data);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

