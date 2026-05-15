import Constants from 'expo-constants';

const fromExtra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

// Prioriza app.json → extra.apiUrl (fonte controlada). .env é fallback.
export const env = {
  apiUrl:
    (fromExtra.apiUrl as string | undefined) ??
    (process.env.EXPO_PUBLIC_API_URL as string | undefined) ??
    'http://localhost:3333',
};
