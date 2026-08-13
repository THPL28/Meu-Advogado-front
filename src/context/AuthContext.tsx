import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Role } from '../types';
import { authApi } from '../services/api';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  cpfCnpj?: string;
  oabNumber?: string;
  oabState?: string;
  companyName?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: Role;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  switchRole: (newRole: Role) => Promise<void>; // demo only
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // On mount – try to restore session from backend (JWT cookie) or localStorage cache
  useEffect(() => {
    let cancelled = false;
    async function restoreSession() {
      try {
        const u = await authApi.getCurrentUser();
        if (!cancelled) setUser(u);
      } catch (err) {
        console.warn('Session restore failed:', err);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    restoreSession();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const loggedIn = await authApi.login(email, password);
      setUser(loggedIn);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha no login. Verifique suas credenciais.';
      setError(msg);
      throw err; // re-throw so the form can react
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } catch { /* ignore */ } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const registered = await authApi.register(data);
      setUser(registered);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha no cadastro. Tente novamente.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await authApi.updateProfile(data);
    setUser(updated);
  }, [user]);

  // Demo-only: switch between LAWYER/CLIENT without real backend call
  const switchRole = useCallback(async (newRole: Role) => {
    setLoading(true);
    const newUser = await authApi.switchRole(newRole);
    setUser(newUser);
    setLoading(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'CLIENT',
        loading,
        error,
        login,
        logout,
        register,
        updateProfile,
        switchRole,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
