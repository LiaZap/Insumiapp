// AsyncStorage é incluso no Expo Go (MMKV exige dev build). Mantém API síncrona
// expondo uma camada em memória + persistência em background pra simplificar.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

type Primitive = string | number | boolean;
const cache = new Map<string, string>();
let hydrated = false;

const PREFIX = 'insumia.';

async function hydrateOnce(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  const keys = await AsyncStorage.getAllKeys();
  const ours = keys.filter((k) => k.startsWith(PREFIX));
  const entries = await AsyncStorage.multiGet(ours);
  entries.forEach(([k, v]) => {
    if (v != null) cache.set(k.slice(PREFIX.length), v);
  });
}

// Best-effort hydrate — começa cedo, mas reads sync usam cache
hydrateOnce().catch(() => {
  /* no-op */
});

class AppStorage {
  set(key: string, value: Primitive) {
    const str = String(value);
    cache.set(key, str);
    AsyncStorage.setItem(PREFIX + key, str).catch(() => {
      /* no-op */
    });
  }
  getString(key: string): string | undefined {
    return cache.get(key);
  }
  getBoolean(key: string): boolean | undefined {
    const v = cache.get(key);
    if (v == null) return undefined;
    return v === 'true';
  }
  getNumber(key: string): number | undefined {
    const v = cache.get(key);
    return v == null ? undefined : Number(v);
  }
  delete(key: string) {
    cache.delete(key);
    AsyncStorage.removeItem(PREFIX + key).catch(() => {
      /* no-op */
    });
  }
  /** Aguarda hidratação inicial — chamar antes de usar reads sync no bootstrap. */
  ready(): Promise<void> {
    return hydrateOnce();
  }
}

export const storage = new AppStorage();

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
