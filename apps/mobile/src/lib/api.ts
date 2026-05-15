import axios, { AxiosError, type AxiosInstance } from 'axios';
import { env } from './env';
import { secureStorage, StorageKeys } from './storage';

export const api: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
});

api.interceptors.request.use(async (config) => {
  const token = await secureStorage.get(StorageKeys.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await secureStorage.delete(StorageKeys.accessToken);
      await secureStorage.delete(StorageKeys.refreshToken);
    }
    return Promise.reject(error);
  },
);
