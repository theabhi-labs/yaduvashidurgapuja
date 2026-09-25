import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
        localStorage.removeItem('auth_token');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (res.data.token) {
        localStorage.setItem('auth_token', res.data.token);
      }
      setUser(res.data.user);
      toast.success(`जय माँ दुर्गे! स्वागत है ${res.data.user.name}`);
      return res.data.user;
    } catch (err: any) {
      toast.error(err.message || 'लॉगिन विफल हुआ');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.register({ name, email, password });
      if (res.data.token) {
        localStorage.setItem('auth_token', res.data.token);
      }
      setUser(res.data.user);
      toast.success(`पंजीकरण सफल! आपका स्वागत है ${res.data.user.name}`);
      return res.data.user;
    } catch (err: any) {
      toast.error(err.message || 'पंजीकरण विफल हुआ');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('auth_token');
      setUser(null);
      toast.info('सफलतापूर्वक लॉगआउट किया गया');
    } catch (err: any) {
      localStorage.removeItem('auth_token');
      setUser(null);
      toast.error(err.message || 'लॉगआउट में समस्या आई');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPERADMIN',
        isSuperAdmin: user?.role === 'SUPERADMIN',
        login,
        register,
        logout,
        refreshUser,
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
