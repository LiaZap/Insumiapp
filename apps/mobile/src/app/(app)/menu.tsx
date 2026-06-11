import { Pressable, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { SolarIcon, type SolarIconName } from '@/components/icons/SolarIcon';
import { useAuthStore } from '@/features/auth/auth.store';
import { colors } from '@/theme/tokens';

type MenuItemProps = {
  icon: SolarIconName;
  label: string;
  onPress: () => void;
};

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-card bg-white px-4 py-4 active:opacity-80"
    >
      <View className="h-10 w-10 items-center justify-center rounded-icon bg-brand-50">
        <SolarIcon name={icon} size={20} color={colors.brand[500]} />
      </View>
      <Text className="flex-1 font-medium text-base text-ink-900">{label}</Text>
      <SolarIcon
        name="alt-arrow-down-linear"
        size={18}
        color="#9AA3B2"
        style={{ transform: [{ rotate: '-90deg' }] }}
      />
    </Pressable>
  );
}

export default function MenuScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  const handleLogout = async () => {
    await clearSession();
    router.replace('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        <Text className="font-bold text-2xl text-brand-700">Menu</Text>
        {user ? (
          <Text className="mt-1 text-sm text-ink-500">
            {user.nome} • {user.empresa ?? user.email}
          </Text>
        ) : null}

        <View className="mt-6 gap-3">
          <MenuItem icon="user-bold" label="Perfil" onPress={() => router.push('/perfil')} />
          <MenuItem icon="chat-round-money-bold" label="Financeiro" onPress={() => router.push('/financeiro')} />
          <MenuItem icon="bell-linear" label="Notificações" onPress={() => router.push('/notificacoes')} />
          <MenuItem icon="box-bold-duotone" label="Movimentações" onPress={() => router.push('/movimentacoes')} />
          <MenuItem icon="map-point-bold" label="Endereços" onPress={() => router.push('/enderecos')} />
          <MenuItem icon="file-check-bold-duotone" label="Ajuda" onPress={() => router.push('/ajuda')} />
        </View>

        <View className="mt-8">
          <Button label="Sair" variant="secondary" fullWidth onPress={handleLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
