import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

import { api } from './api';

/**
 * Pede permissão de notificação, registra o ExpoPushToken
 * no backend e configura como o app vai mostrar pushes.
 * Idempotente: chama sem medo após cada login.
 */
export async function registrarPushNotifications(): Promise<void> {
  // Simulator não suporta push real
  if (!Device.isDevice) return;

  try {
    // 1) Permissão (iOS exige; Android Tiramisu+ também)
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    // 2) Pega o token Expo Push
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      (Constants?.easConfig as { projectId?: string } | undefined)?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenData.data;
    if (!token) return;

    // 3) Configura comportamento default (mostrar alert mesmo com app aberto)
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // 4) Canal padrão no Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Padrão',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1B498C',
      });
    }

    // 5) Envia o token pro backend
    await api.post('/api/v1/push/register', {
      token,
      plataforma: Platform.OS === 'ios' ? 'ios' : 'android',
    });
  } catch {
    // Falha silenciosa — push é "nice to have", não pode quebrar o app
  }
}
