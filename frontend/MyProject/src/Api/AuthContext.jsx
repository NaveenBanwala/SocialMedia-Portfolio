import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null); // Store user info

  useEffect(() => {
    // Listen for storage changes (other tabs)
    const handleStorage = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    // Fetch user profile if token changes
    const fetchUser = async () => {
      if (token) {
        try {
          // Assume /users/me returns user info including roles
          const res = await api.get('/users/me');
          setUser(res.data);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  // Check if user has admin role (assuming roles is an array of strings or objects)
  const isAdmin = user && (user.roles?.includes('ROLE_ADMIN') || user.roles?.some?.(r => r.name === 'ROLE_ADMIN'));

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 