import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { SolarIcon } from '@/components/icons/SolarIcon';
import { storage, StorageKeys } from '@/lib/storage';

export default function Onboarding() {
  const router = useRouter();

  const handleContinue = () => {
    storage.set(StorageKeys.onboardingSeen, true);
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-base">
      <View className="flex-1 justify-between px-6 py-8">
        <View className="flex-1 items-center justify-center">
          <View className="h-32 w-32 items-center justify-center rounded-card bg-brand-500">
            <SolarIcon name="jar-of-pills-linear" size={64} color="#fff" />
          </View>
          <Text className="mt-8 text-center font-bold text-3xl text-brand-700">
            Bem-vindo ao Insumia
          </Text>
          <Text className="mt-3 text-center font-sans text-base text-ink-500">
            Gestão de pedidos, estoque e financeiro de insumos farmacêuticos em um só lugar.
          </Text>
        </View>
        <Button label="Começar" fullWidth size="lg" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}
