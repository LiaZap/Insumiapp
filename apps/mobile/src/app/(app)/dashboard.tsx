import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SolarIcon } from '@/components/icons/SolarIcon';
import { useAuthStore } from '@/features/auth/auth.store';
import { colors } from '@/theme/tokens';

const USAGE_DATA = [
  94, 73, 63, 68, 73, 68, 80, 88, 88, 80, 80, 73, 63, 56, 63, 76, 76, 83, 94, 97, 97, 97, 97, 103,
  41, 97, 103, 97, 107, 107,
];

const QUICK_ACTIONS = [
  { label: 'Endereço Comercial', icon: 'map-point-bold' as const },
  { label: 'Dados de Faturamento', icon: 'chat-round-money-bold' as const },
  { label: 'Usuários e Permissões', icon: 'user-bold' as const },
  { label: 'Nossa Proposta', icon: 'file-check-bold-duotone' as const },
];

export default function Dashboard() {
  const router = useRouter();
  const highlightIndex = useMemo(() => 24, []); // barra cyan no Figma

  const user = useAuthStore((s) => s.user);
  const nomeExibido = user?.empresa ?? user?.nome ?? 'Minha Clínica';
  const primeiroNome = user?.nome?.split(' ').filter(Boolean).slice(0, 2).join(' ') ?? '';
  const iniciais =
    nomeExibido
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || 'IN';

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-800">
              <Text className="font-bold text-white">{iniciais}</Text>
            </View>
            <View>
              <Text className="font-sans text-xs text-ink-500">
                {primeiroNome ? `Olá, ${primeiroNome}` : 'Bem-vindo(a)'}
              </Text>
              <Text className="font-semibold text-sm text-brand-700">{nomeExibido}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push('/notificacoes')}
              className="h-12 w-12 items-center justify-center rounded-pill bg-white/60 active:opacity-80"
            >
              <SolarIcon name="bell-linear" size={20} color={colors.brand[500]} />
            </Pressable>
            <View className="h-12 w-12 rounded-full bg-brand-100" />
          </View>
        </View>

        {/* Stock info card */}
        <View className="mt-6 mx-5 rounded-card bg-white/70 px-5 pt-6 pb-5">
          <View className="flex-row items-start justify-between">
            <Text className="font-medium text-sm text-brand-500">
              Estoque <Text className="font-semibold">Insumia®</Text>
            </Text>
            <View className="h-9 flex-row items-center gap-2 rounded-pill bg-white px-3">
              <Text className="font-semibold text-xs text-brand-800/75">Alertas</Text>
              <View className="h-4 w-4 items-center justify-center rounded-full bg-danger">
                <Text className="font-sora text-[9px] text-white">3</Text>
              </View>
            </View>
          </View>

          <Text
            className="mt-4 font-medium text-[32px] text-brand-500"
            style={{ letterSpacing: -0.5 }}
          >
            R$1.300.394,93
          </Text>
          <Text className="mt-2 text-sm text-ink-700">104 Produtos em estoque</Text>

          {/* Quick actions row */}
          <View className="mt-5 flex-row gap-6">
            <QuickIconAction
              icon="add-square-bold-duotone"
              label="Solicitar"
              filled
              onPress={() => router.navigate('/novo-pedido')}
            />
            <QuickIconAction
              icon="file-check-bold-duotone"
              label="Aprovar"
              badge={3}
              onPress={() => router.navigate('/pedidos')}
            />
            <QuickIconAction
              icon="box-bold-duotone"
              label="Acompanhar"
              onPress={() => router.navigate('/pedidos')}
            />
          </View>
        </View>

        {/* Order status card */}
        <View className="mt-3 mx-5 rounded-card bg-brand-800 px-5 py-5">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="font-semibold text-sm text-white">Último Pedido #123456</Text>
              <Text className="mt-1 text-xs text-white/50">Confira o status do seu pedido</Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <SolarIcon name="clock-circle-linear" size={16} color="#fff" />
            </View>
          </View>
          <Text className="mt-4 text-xs leading-5 text-white/75">
            Pedido Aprovado aguardando liberação pela Insumia®
          </Text>
          <Pressable className="absolute right-4 bottom-4 h-9 w-9 items-center justify-center rounded-2xl bg-black/30 active:opacity-80">
            <SolarIcon name="arrow-right-up-linear" size={16} color="#fff" />
          </Pressable>
        </View>

        {/* Cards grid (horizontal scroll) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, gap: 8 }}
        >
          {QUICK_ACTIONS.map((a) => (
            <View
              key={a.label}
              className="h-[150px] w-[150px] justify-end rounded-card bg-white p-5"
            >
              <View className="absolute left-4 top-4 h-10 w-10 items-center justify-center rounded-iconLg bg-brand-50">
                <SolarIcon name={a.icon} size={20} color={colors.brand[500]} />
              </View>
              <Text className="font-semibold text-sm text-brand-500" style={{ lineHeight: 18 }}>
                {a.label}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Frequency card */}
        <View className="mt-3 mx-5 rounded-card bg-brand-800 px-5 py-5">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="font-medium text-base text-white">Frequência de Uso</Text>
              <Text className="mt-1 text-xs text-white/25">
                Movimentações por dia em <Text className="text-white">Janeiro</Text>
              </Text>
            </View>
            <Pressable className="h-10 w-10 items-center justify-center rounded-icon bg-brand-700 active:opacity-80">
              <SolarIcon name="transfer-vertical-linear" size={18} color="#fff" />
            </Pressable>
          </View>

          <View className="mt-6 h-[110px] flex-row items-end justify-between">
            {USAGE_DATA.map((h, i) => (
              <View
                key={i}
                style={{
                  width: 4,
                  height: h,
                  borderRadius: 31,
                  backgroundColor: i === highlightIndex ? colors.accent[400] : 'rgba(255,255,255,0.26)',
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickIconAction({
  icon,
  label,
  filled = false,
  badge,
  onPress,
}: {
  icon: Parameters<typeof SolarIcon>[0]['name'];
  label: string;
  filled?: boolean;
  badge?: number;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="items-center gap-2 active:opacity-70">
      <View
        className={[
          'h-12 w-12 items-center justify-center rounded-icon',
          filled ? 'bg-brand-500' : 'bg-brand-50',
        ].join(' ')}
      >
        <SolarIcon name={icon} size={22} color={filled ? '#fff' : colors.brand[500]} />
        {badge != null ? (
          <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-danger">
            <Text className="font-sora text-[10px] text-white">{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text className="text-[11px] text-ink-500">{label}</Text>
    </Pressable>
  );
}
