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
  register: (name: string, email: string, password: string, username?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserState: (user: User) => void;
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

  const updateUserState = useCallback((updatedUser: User) => {
    setUser(updatedUser);
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
      toast.success(`Welcome back, ${res.data.user.name}!`);
      return res.data.user;
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, username?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.register({ name, email, password, username });
      if (res.data.token) {
        localStorage.setItem('auth_token', res.data.token);
      }
      setUser(res.data.user);
      toast.success(`Registration successful! Welcome, ${res.data.user.name}`);
      return res.data.user;
    } catch (err: any) {
      toast.error(err.message || 'Registration failed.');
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
      toast.info('Logged out successfully.');
    } catch (err: any) {
      localStorage.removeItem('auth_token');
      setUser(null);
      toast.error(err.message || 'Error during logout.');
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
        updateUserState,
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
