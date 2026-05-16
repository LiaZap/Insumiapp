import { useState } from 'react';
import { FlatList, Pressable, Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { Medicamento, MedicamentoCategoria } from '@insumia/shared';

import { SolarIcon } from '@/components/icons/SolarIcon';
import { SearchBar } from '@/components/medicamento/SearchBar';
import { CategoryChips } from '@/components/medicamento/CategoryChips';
import { MedicamentoRow } from '@/components/medicamento/MedicamentoRow';
import { PillCTA } from '@/components/ui/PillCTA';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useMedicamentos } from '@/features/medicamentos/medicamentos.hooks';
import { useCarrinhoStore, selectTotalItens } from '@/features/pedidos/carrinho.store';

export default function BuscaScreen() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState<MedicamentoCategoria | null>(null);
  const debouncedQ = useDebounce(q, 300);

  const { data, isLoading } = useMedicamentos({
    q: debouncedQ || undefined,
    categoria: categoria ?? undefined,
  });

  const add = useCarrinhoStore((s) => s.add);
  const totalItens = useCarrinhoStore(selectTotalItens);

  const handleAdd = (med: Medicamento) => add(med, 1);

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-[15px] bg-black/5 active:opacity-70"
        >
          <SolarIcon name="alt-arrow-down-linear" size={18} color="#515151" style={{ transform: [{ rotate: '90deg' }] }} />
        </Pressable>
        <Text className="font-semibold text-base text-[#515151]">Novo Pedido</Text>
        <View className="h-10 w-10" />
      </View>

      <View className="mt-2">
        <SearchBar value={q} onChangeText={setQ} />
      </View>

      <View className="mt-3">
        <CategoryChips selected={categoria} onChange={setCategoria} />
      </View>

      <View className="flex-1 px-5 pt-2">
        {isLoading ? (
          <View className="mt-4 gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width="100%" height={64} radius={14} />
            ))}
          </View>
        ) : (
          <FlatList
            data={data?.data ?? []}
            keyExtractor={(m) => m.id}
            renderItem={({ item, index }) => (
              <MedicamentoRow
                medicamento={item}
                trailing="menu"
                quantityLabel={item.dosagem ?? undefined}
                onPress={() => handleAdd(item)}
                onTrailingPress={() => handleAdd(item)}
                dashed={index !== (data?.data.length ?? 0) - 1}
              />
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-16">
                <SolarIcon name="search-linear" size={40} color="#B3B3B3" />
                <Text className="mt-3 text-sm text-ink-500">
                  {debouncedQ || categoria ? 'Nada encontrado' : 'Carregue medicamentos da API'}
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 220 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {totalItens > 0 ? (
        <View className="absolute bottom-28 self-center">
          <PillCTA label={`Ver Pedido • ${totalItens}`} onPress={() => router.push('/novo-pedido/carrinho')} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
