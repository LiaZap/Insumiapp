// Web fallback — usa localStorage diretamente
import * as SecureStore from 'expo-secure-store';

type Primitive = string | number | boolean;
const PREFIX = 'insumia.';

class WebStorage {
  set(key: string, value: Primitive) {
    window.localStorage.setItem(PREFIX + key, String(value));
  }
  getString(key: string): string | undefined {
    return window.localStorage.getItem(PREFIX + key) ?? undefined;
  }
  getBoolean(key: string): boolean | undefined {
    const v = window.localStorage.getItem(PREFIX + key);
    if (v == null) return undefined;
    return v === 'true';
  }
  getNumber(key: string): number | undefined {
    const v = window.localStorage.getItem(PREFIX + key);
    return v == null ? undefined : Number(v);
  }
  delete(key: string) {
    window.localStorage.removeItem(PREFIX + key);
  }
  async ready() {
    /* sync no web */
  }
}

export const storage = new WebStorage();

export const secureStorage = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  delete: (key: string) => SecureStore.deleteItemAsync(key),
};

export const StorageKeys = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
  onboardingSeen: 'app.onboardingSeen',
} as const;
