import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SolarIcon, type SolarIconName } from '@/components/icons/SolarIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useNotificacoes, type Notificacao } from '@/features/notificacoes/notificacoes.hooks';
import { colors } from '@/theme/tokens';

type Tab = 'todas' | 'alertas' | 'pedidos';

const ICONS: Record<Notificacao['tipo'], SolarIconName> = {
  pedido: 'box-bold-duotone',
  alerta: 'bell-linear',
  sistema: 'file-check-bold-duotone',
};

function formatDateBadge(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase();
}

function Row({ n, onPress }: { n: Notificacao; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between py-3 active:opacity-70">
      <View className="flex-1 flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-icon bg-brand-50">
          <SolarIcon name={ICONS[n.tipo]} size={20} color={colors.brand[500]} />
        </View>
        <View className="flex-1">
          <Text className="font-medium text-sm text-[#4A4A4A]">{n.titulo}</Text>
          <Text numberOfLines={1} className="mt-1 text-[10px] text-[#969696]">
            {n.descricao}
          </Text>
        </View>
      </View>
      <View className="ml-2 h-7 items-center justify-center rounded-pill bg-[#E7E7E7] px-3">
        <Text className="font-semibold text-[10px] text-[#636363]">{formatDateBadge(n.data)}</Text>
      </View>
    </Pressable>
  );
}

export default function NotificacoesScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('todas');
  const { data, isLoading } = useNotificacoes();

  const filtered = (data ?? []).filter((n) => {
    if (tab === 'todas') return true;
    if (tab === 'alertas') return n.tipo === 'alerta';
    if (tab === 'pedidos') return n.tipo === 'pedido';
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-[15px] bg-black/5 active:opacity-70"
        >
          <SolarIcon
            name="alt-arrow-down-linear"
            size={18}
            color="#515151"
            style={{ transform: [{ rotate: '90deg' }] }}
          />
        </Pressable>
        <Text className="font-semibold text-base text-[#515151]">Notificações</Text>
        <View className="h-10 w-10" />
      </View>

      {/* Filter chips */}
      <View className="flex-row gap-2 px-5 pb-3">
        {(['todas', 'alertas', 'pedidos'] as Tab[]).map((t) => {
          const active = tab === t;
          const count = (data ?? []).filter((n) => {
            if (t === 'todas') return true;
            if (t === 'alertas') return n.tipo === 'alerta';
            return n.tipo === 'pedido';
          }).length;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 34,
                borderWidth: 1,
                borderColor: active ? '#000' : '#9AA3B2',
                backgroundColor: active ? '#fff' : 'transparent',
              }}
            >
              <Text
                style={{
                  color: active ? '#000' : '#606060',
                  fontSize: 11,
                  fontFamily: 'Figtree_500Medium',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </Text>
              <View
                style={{
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  paddingHorizontal: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.brand[500],
                }}
              >
                <Text
                  style={{ color: '#fff', fontSize: 9, fontFamily: 'Sora_700Bold' }}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View className="gap-3 px-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={56} radius={14} />
          ))}
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState icon="bell-linear" title="Sem notificações" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(n) => n.id}
          renderItem={({ item }) => (
            <View className="px-5">
              <Row
                n={item}
                onPress={() =>
                  item.pedidoId ? router.push(`/pedido/${item.pedidoId}`) : undefined
                }
              />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: '#E0E0E0', marginHorizontal: 20 }} />
          )}
        />
      )}
    </SafeAreaView>
  );
}
