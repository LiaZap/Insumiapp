import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Pedido, PedidoStatus } from '@insumia/shared';

import { SolarIcon } from '@/components/icons/SolarIcon';
import { PedidoCard } from '@/components/pedidos/PedidoCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePedidos } from '@/features/pedidos/pedidos.hooks';
import { colors } from '@/theme/tokens';

type FilterKey = 'todos' | 'aprovados' | 'aguardando' | 'cancelados';

const FILTERS: Array<{ key: FilterKey; label: string; match: (p: Pedido) => boolean }> = [
  { key: 'todos', label: 'Todos', match: () => true },
  {
    key: 'aguardando',
    label: 'Aguardando',
    match: (p) => p.status === 'aguardando_cotacao' || p.status === 'cotado',
  },
  {
    key: 'aprovados',
    label: 'Aprovados',
    match: (p) =>
      p.status === 'confirmado' ||
      p.status === 'em_separacao' ||
      p.status === 'enviado' ||
      p.status === 'entregue',
  },
  { key: 'cancelados', label: 'Cancelados', match: (p) => p.status === 'cancelado' },
];

export default function PedidosScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>('todos');
  const { data, isLoading, isError, isRefetching, refetch } = usePedidos();

  const counts = useMemo(() => {
    const all = data ?? [];
    return Object.fromEntries(FILTERS.map((f) => [f.key, all.filter(f.match).length])) as Record<
      FilterKey,
      number
    >;
  }, [data]);

  const filtered = useMemo(() => {
    const all = data ?? [];
    const f = FILTERS.find((x) => x.key === filter)!;
    return all.filter(f.match);
  }, [data, filter]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <View className="h-10 w-10" />
        <Text className="font-semibold text-base text-[#515151]">Pedidos</Text>
        <Pressable
          onPress={() => router.push('/notificacoes')}
          className="h-10 w-10 items-center justify-center rounded-[15px] bg-black/5 active:opacity-70"
        >
          <SolarIcon name="bell-linear" size={18} color="#515151" />
        </Pressable>
      </View>

      {/* Filter chips */}
      <View className="px-5 pb-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(f) => f.key}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => {
            const active = filter === item.key;
            const count = counts[item.key];
            return (
              <Pressable
                onPress={() => setFilter(item.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 34,
                  borderWidth: 1,
                  borderColor: active ? colors.brand[500] : 'rgba(27,73,140,0.4)',
                  backgroundColor: active ? colors.brand[500] : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: active ? '#fff' : 'rgba(27,73,140,0.7)',
                    fontSize: 11,
                    fontFamily: 'Figtree_500Medium',
                  }}
                >
                  {item.label}
                </Text>
                <View
                  style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    paddingHorizontal: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: active ? '#fff' : colors.brand[500],
                  }}
                >
                  <Text
                    style={{
                      color: active ? colors.brand[500] : '#fff',
                      fontSize: 9,
                      fontFamily: 'Sora_700Bold',
                    }}
                  >
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Body */}
      {isError && !data ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <View className="gap-3 px-5">
          <Skeleton width="100%" height={156} radius={31} />
          <Skeleton width="100%" height={64} radius={14} />
          <Skeleton width="100%" height={64} radius={14} />
        </View>
      ) : !featured ? (
        <EmptyState
          icon="inbox-linear"
          title="Nenhum pedido por aqui"
          description="Crie seu primeiro pedido tocando no + no menu inferior."
          actionLabel="Novo Pedido"
          onAction={() => router.navigate('/novo-pedido')}
        />
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(p) => p.id}
          ListHeaderComponent={
            <View className="px-5">
              <PedidoCard
                pedido={featured}
                variant="featured"
                onPress={() => router.push(`/pedido/${featured.id}`)}
              />
              {rest.length > 0 ? (
                <Text className="mt-6 mb-1 text-xs font-medium text-ink-500">
                  Anteriores
                </Text>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <View className="px-5">
              <PedidoCard
                pedido={item}
                onPress={() => router.push(`/pedido/${item.id}`)}
              />
              <View style={{ height: 1, backgroundColor: '#E0E0E0' }} />
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
          }
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
