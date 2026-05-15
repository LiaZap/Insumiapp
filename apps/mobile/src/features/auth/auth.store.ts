import { create } from 'zustand';
import type { User } from '@insumia/shared';
import { storage, secureStorage, StorageKeys } from '@/lib/storage';

const USER_KEY = 'auth.user';

type AuthState = {
  user: User | null;
  isHydrated: boolean;
  setSession: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  clearSession: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,

  setSession: async (user, accessToken, refreshToken) => {
    await secureStorage.set(StorageKeys.accessToken, accessToken);
    await secureStorage.set(StorageKeys.refreshToken, refreshToken);
    storage.set(USER_KEY, JSON.stringify(user));
    set({ user });
  },

  clearSession: async () => {
    await secureStorage.delete(StorageKeys.accessToken);
    await secureStorage.delete(StorageKeys.refreshToken);
    storage.delete(USER_KEY);
    set({ user: null });
  },

  hydrate: async () => {
    const token = await secureStorage.get(StorageKeys.accessToken);
    const userJson = storage.getString(USER_KEY);
    let user: User | null = null;
    if (token && userJson) {
      try {
        user = JSON.parse(userJson) as User;
      } catch {
        user = null;
      }
    }
    set({ isHydrated: true, user });
  },
}));
