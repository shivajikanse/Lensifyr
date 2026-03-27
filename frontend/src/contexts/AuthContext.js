import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { organizerApi } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await organizerApi.getProfile();
      setUser(data.organizer);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const { data } = await organizerApi.login({ email, password });
    localStorage.setItem('token', data.token);
    setUser(data.organizer);
    return data;
  };

  const register = async (formData) => {
    const { data } = await organizerApi.register(formData);
    localStorage.setItem('token', data.token);
    setUser(data.organizer);
    return data;
  };

  const logout = async () => {
    try { await organizerApi.logout(); } catch {}
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const { data } = await organizerApi.getProfile();
      setUser(data.organizer);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
