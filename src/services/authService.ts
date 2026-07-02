import { apiRequest } from './api';

const AUTH_KEY = 'upwork_auth';

export interface AuthState {
  isLoggedIn: boolean;
  email: string | null;
}

export function getAuthState(): AuthState {
  const stored = localStorage.getItem(AUTH_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { isLoggedIn: false, email: null };
    }
  }
  return { isLoggedIn: false, email: null };
}

export function setAuthState(email: string): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ isLoggedIn: true, email }));
}

export function clearAuthState(): void {
  localStorage.removeItem(AUTH_KEY);
}

export async function login(email: string, password: string): Promise<void> {
  await apiRequest<string>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  }, true);
  setAuthState(email);
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
  });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}
