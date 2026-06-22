import { api, setToken, clearToken, getToken } from './api';
import type { User } from '@insumia/shared';

const USER_KEY = 'insumia.admin.user';

type AuthResponse = { user: User; accessToken: string };

export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post<AuthResponse>('/api/v1/auth/login', { email, password });
  setToken(data.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  clearToken();
  localStorage.removeItem(USER_KEY);
}

export function currentUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getToken() && currentUser());
}

/** O back-office é exclusivo de operadores admin. */
export function isAdmin(): boolean {
  return currentUser()?.role === 'admin';
}
