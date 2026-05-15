import { useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Conta, ContaTipo } from '@insumia/shared';

import { SolarIcon } from '@/components/icons/SolarIcon';
import { KPICard } from '@/components/financeiro/KPICard';
import { ContaRow } from '@/components/financeiro/ContaRow';
import { FluxoMensalChart } from '@/components/financeiro/FluxoMensalChart';
import { NovaContaSheet } from '@/components/financeiro/NovaContaSheet';
import { useToast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useContas,
  useDashboardFinanceiro,
  useMarcarPaga,
} from '@/features/financeiro/financeiro.hooks';

type Tab = 'todos' | 'pagar' | 'receber';

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'pagar', label: 'A Pagar' },
  { key: 'receber', label: 'A Receber' },
];

export default function FinanceiroScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('todos');
  const [sheetOpen, setSheetOpen] = useState(false);
  const tipo: ContaTipo | undefined = tab === 'todos' ? undefined : tab;
  const {
    data: contas,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useContas(tipo ? { tipo } : undefined);
  const { data: dashboard } = useDashboardFinanceiro();
  const marcar = useMarcarPaga();
  const toast = useToast();

  const handlePagar = (c: Conta) => {
    if (c.status === 'paga') return;
    Alert.alert(
      'Marcar como paga?',
      `${c.descricao} • R$ ${Number(c.valor).toFixed(2)}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () =>
            marcar.mutate(c.id, {
              onSuccess: () => toast.show('Conta marcada como paga', 'success'),
              onError: () => toast.show('Não foi possível atualizar', 'error'),
            }),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={['top']}>
      {/* Header */}
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
        <Text className="font-semibold text-base text-[#515151]">Financeiro</Text>
        <Pressable
          onPress={() => setSheetOpen(true)}
          className="h-10 w-10 items-center justify-center rounded-[15px] bg-brand-500 active:opacity-80"
        >
          <SolarIcon name="add-square-bold-duotone" size={18} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={contas ?? []}
        keyExtractor={(c) => c.id}
        ListHeaderComponent={
          <View>
            {/* KPIs */}
            {dashboard ? (
              <View className="mx-5 flex-row gap-2">
                <KPICard tone="pagar" label="A Pagar" valor={Number(dashboard.totalAPagar)} />
                <KPICard tone="receber" label="A Receber" valor={Number(dashboard.totalAReceber)} />
                <KPICard tone="vencidas" label="Vencidas" count={dashboard.vencidasCount} />
              </View>
            ) : isLoading ? (
              <View className="mx-5 flex-row gap-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} width="100%" height={100} radius={30} className="flex-1" />
                ))}
              </View>
            ) : null}

            {/* Fluxo */}
            {dashboard ? (
              <View className="mt-3">
                <FluxoMensalChart fluxo={dashboard.fluxoMensal} />
              </View>
            ) : null}

            {/* Tabs */}
            <View className="mt-6 flex-row gap-2 px-5">
              {TABS.map((t) => {
                const active = tab === t.key;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setTab(t.key)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 34,
                      backgroundColor: active ? '#1B498C' : 'transparent',
                      borderWidth: 1,
                      borderColor: active ? '#1B498C' : 'rgba(27,73,140,0.4)',
                    }}
                  >
                    <Text
                      style={{
                        color: active ? '#fff' : 'rgba(27,73,140,0.7)',
                        fontSize: 12,
                        fontFamily: 'Figtree_500Medium',
                      }}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="mt-3 mb-1 px-5 text-xs font-medium text-ink-500">
              {tipo === 'pagar' ? 'Contas a Pagar' : tipo === 'receber' ? 'Contas a Receber' : 'Contas'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mx-5 mb-2">
            <ContaRow conta={item} onPress={() => handlePagar(item)} />
          </View>
        )}
        ListEmptyComponent={
          isError && !contas ? (
            <ErrorState onRetry={() => refetch()} />
          ) : isLoading ? (
            <View className="mx-5 gap-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} width="100%" height={72} radius={30} />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="chat-round-money-bold"
              title="Nenhuma conta aqui"
              description="Toque no + acima para criar uma conta a pagar ou receber."
            />
          )
        }
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      <NovaContaSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </SafeAreaView>
  );
}
