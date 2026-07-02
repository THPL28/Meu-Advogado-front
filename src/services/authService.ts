import { apiRequest } from './api';

const AUTH_KEY = 'legalwork_auth';

export interface AuthState {
  isLoggedIn: boolean;
  email: string | null;
  roles: string[];
  userId: number | null;
  firstName: string | null;
  lastName: string | null;
}

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  accountEnabled: boolean;
  accountLocked: boolean;
}

const defaultAuthState: AuthState = {
  isLoggedIn: false,
  email: null,
  roles: [],
  userId: null,
  firstName: null,
  lastName: null,
};

export function getAuthState(): AuthState {
  const stored = localStorage.getItem(AUTH_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { ...defaultAuthState };
    }
  }
  return { ...defaultAuthState };
}

export function setAuthState(user: CurrentUser): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    isLoggedIn: true,
    email: user.email,
    roles: user.roles,
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
  }));
}

export function clearAuthState(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function hasRole(role: string): boolean {
  const state = getAuthState();
  return state.roles.includes(role);
}

export function isLawyer(): boolean {
  return hasRole('ROLE_LAWYER');
}

export function isClient(): boolean {
  return hasRole('ROLE_CLIENT');
}

export function isFirm(): boolean {
  return hasRole('ROLE_FIRM');
}

export function isAdmin(): boolean {
  return hasRole('ROLE_ADMIN');
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    const response = await apiRequest<{ success: boolean; data: CurrentUser }>('/api/auth/me', {
      credentials: 'include',
    });
    if (response && response.success && response.data) {
      return response.data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<void> {
  const rawResponse = await apiRequest<string>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  }, true);
  
  // After successful login, fetch user info
  const user = await fetchCurrentUser();
  if (user) {
    setAuthState(user);
  } else {
    // Fallback: set basic auth state
    setAuthState({
      id: 0,
      firstName: '',
      lastName: '',
      email,
      roles: [],
      accountEnabled: true,
      accountLocked: false,
    });
  }
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Ignore logout errors
  }
  clearAuthState();
}

export async function register(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string[];
}): Promise<void> {
  await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    credentials: 'include',
  });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
    credentials: 'include',
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
    credentials: 'include',
  });
}
