import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getCurrentUser, getAuthToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyUser() {
      const token = getAuthToken();
      if (token) {
        try {
          const res = await api.auth.getMe();
          if (res && res.user) {
            setUser(res.user);
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out.');
          api.auth.logout();
          setUser(null);
        }
      }
      setLoading(false);
    }
    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login(email, password);
    setUser(res.user);
    return res.user;
  };

  const register = async (name, email, password, role, department) => {
    const res = await api.auth.register(name, email, password, role, department);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  const isCitizen = user?.role === 'CITIZEN';
  const isAdmin = user?.role === 'ADMIN';
  const isOfficer = user?.role === 'OFFICER';
  const isStaff = isAdmin || isOfficer;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isCitizen, isAdmin, isOfficer, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
