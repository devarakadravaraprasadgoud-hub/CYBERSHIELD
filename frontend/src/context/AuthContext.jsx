import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('cybershield_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('cybershield_token');
      if (savedToken) {
        try {
          const res = await axiosClient.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          localStorage.removeItem('cybershield_token');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    const { user: loggedInUser, accessToken } = res.data;
    localStorage.setItem('cybershield_token', accessToken);
    setToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (formData) => {
    const res = await axiosClient.post('/auth/register', formData);
    const { user: registeredUser, accessToken } = res.data;
    localStorage.setItem('cybershield_token', accessToken);
    setToken(accessToken);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('cybershield_token');
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await axiosClient.patch('/auth/profile', profileData);
    setUser(res.data.user);
    return res.data.user;
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isInstructor: user?.role === 'instructor',
    isLearner: user?.role === 'learner',
    isLoading,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
