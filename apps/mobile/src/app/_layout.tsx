import '@/theme/global.css';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { queryClient, asyncStoragePersister } from '@/lib/query-client';
import { storage } from '@/lib/storage';
import { useAuthStore } from '@/features/auth/auth.store';
import { useAppFonts } from '@/hooks/useAppFonts';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/Toast';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* no-op */
});

export default function RootLayout() {
  const fontsLoaded = useAppFonts();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    storage.ready().then(() => setStorageReady(true));
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated && fontsLoaded && storageReady) {
      SplashScreen.hideAsync().catch(() => {
        /* no-op */
      });
    }
  }, [isHydrated, fontsLoaded, storageReady]);

  if (!isHydrated || !fontsLoaded || !storageReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: asyncStoragePersister, maxAge: 1000 * 60 * 60 * 24 }}
          >
            <ToastProvider>
              <StatusBar style="dark" backgroundColor="#F2F2F2" />
              <View style={{ flex: 1 }}>
                <OfflineBanner />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#F2F2F2' },
                    animation: 'slide_from_right',
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(app)" />
                </Stack>
              </View>
            </ToastProvider>
          </PersistQueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
