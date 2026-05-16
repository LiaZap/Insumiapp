import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { EstoqueResumo, MedicamentoCategoria } from '@insumia/shared';

import { SolarIcon } from '@/components/icons/SolarIcon';
import { SearchBar } from '@/components/medicamento/SearchBar';
import { CategoryChips } from '@/components/medicamento/CategoryChips';
import { EstoqueHeroCard } from '@/components/estoque/EstoqueHeroCard';
import { StockRow } from '@/components/estoque/StockRow';
import { InformarUsoSheet } from '@/components/estoque/InformarUsoSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useEstoque } from '@/features/estoque/estoque.hooks';
import { useDebounce } from '@/hooks/useDebounce';

export default function EstoqueScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useEstoque();
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState<MedicamentoCategoria | null>(null);
  const [selected, setSelected] = useState<EstoqueResumo | null>(null);
  const debouncedQ = useDebounce(q, 250);

  const filtered = useMemo(() => {
    const all = data ?? [];
    return all.filter((item) => {
      if (categoria && item.medicamento.categoria !== categoria) return false;
      if (debouncedQ) {
        const haystack = `${item.medicamento.nome} ${item.medicamento.fabricante ?? ''}`.toLowerCase();
        if (!haystack.includes(debouncedQ.toLowerCase())) return false;
      }
      return true;
    });
  }, [data, categoria, debouncedQ]);

  const totalValor = useMemo(() => {
    return (data ?? []).reduce((sum, i) => {
      const price = Number(i.medicamento.precoUnitario ?? 0);
      return sum + price * i.quantidade;
    }, 0);
  }, [data]);

  const totalProdutos = (data ?? []).length;

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <View className="h-10 w-10" />
        <Text className="font-semibold text-base text-[#515151]">Estoque</Text>
        <Pressable
          onPress={() => router.push('/movimentacoes')}
          className="h-10 w-10 items-center justify-center rounded-[15px] bg-black/5 active:opacity-70"
        >
          <SolarIcon name="transfer-vertical-linear" size={18} color="#515151" />
        </Pressable>
      </View>

      {isError && !data ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <View className="px-5 gap-3">
          <Skeleton width="100%" height={140} radius={30} />
          <Skeleton width="100%" height={59} radius={18} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.medicamento.id}
          ListHeaderComponent={
            <View>
              <EstoqueHeroCard totalValor={totalValor} totalProdutos={totalProdutos} />
              <View className="mt-4">
                <SearchBar value={q} onChangeText={setQ} />
              </View>
              <View className="mt-3 mb-2">
                <CategoryChips selected={categoria} onChange={setCategoria} />
              </View>
            </View>
          }
          renderItem={({ item, index }) => (
            <View className="px-5">
              <StockRow
                item={item}
                onPress={() => setSelected(item)}
                dashed={index !== filtered.length - 1}
              />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="box-bold-duotone"
              title={debouncedQ || categoria ? 'Nada encontrado' : 'Sem estoque'}
              description="Adicione produtos via 'Movimentar' ou peça via Novo Pedido."
            />
          }
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <InformarUsoSheet
        visible={!!selected}
        onClose={() => setSelected(null)}
        item={selected}
      />
    </SafeAreaView>
  );
}
