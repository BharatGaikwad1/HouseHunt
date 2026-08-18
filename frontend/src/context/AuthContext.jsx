import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

let baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (baseApiUrl && !baseApiUrl.endsWith('/api') && !baseApiUrl.endsWith('/api/')) {
  baseApiUrl = baseApiUrl.replace(/\/$/, '') + '/api';
}
export const API_URL = baseApiUrl;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from sessionStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = sessionStorage.getItem('househunt_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          // Verify token is still valid by requesting profile
          const res = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${parsed.token}` },
          });
          setUser({ ...res.data, token: parsed.token });
        } catch (err) {
          console.error('Session expired or invalid token');
          sessionStorage.removeItem('househunt_user');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register User
  const register = async (name, email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role,
      });
      setUser(res.data);
      sessionStorage.setItem('househunt_user', JSON.stringify(res.data));
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Registration failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Login User
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      setUser(res.data);
      sessionStorage.setItem('househunt_user', JSON.stringify(res.data));
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Login failed';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Logout User
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('househunt_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
