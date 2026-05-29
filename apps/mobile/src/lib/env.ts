import Constants from 'expo-constants';

const fromExtra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

// URL de produção como fallback final — garante que o build de release
// nunca caia em localhost mesmo se o expo-constants nao expor `extra`.
const PROD_API_URL = 'https://sistemas-api.cusrzj.easypanel.host';

export const env = {
  apiUrl:
    (process.env.EXPO_PUBLIC_API_URL as string | undefined) ??
    (fromExtra.apiUrl as string | undefined) ??
    PROD_API_URL,
};
