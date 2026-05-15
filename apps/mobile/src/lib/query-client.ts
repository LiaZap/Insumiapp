import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      gcTime: 1000 * 60 * 60 * 24, // 24h — necessário p/ persistência offline
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'insumia.query-cache',
  throttleTime: 1000,
});
