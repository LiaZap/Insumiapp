import { Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { SolarIcon } from '@/components/icons/SolarIcon';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/** Faixa que aparece quando o dispositivo está offline. */
export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  if (isOnline) return null;

  return (
    <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
      <View className="flex-row items-center justify-center gap-2 bg-warning px-4 py-1.5">
        <SolarIcon name="bell-linear" size={13} color="#fff" />
        <Text className="font-medium text-xs text-white">
          Sem conexão — exibindo dados salvos
        </Text>
      </View>
    </Animated.View>
  );
}
