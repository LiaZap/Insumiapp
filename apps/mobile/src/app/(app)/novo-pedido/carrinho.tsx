import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { SolarIcon } from '@/components/icons/SolarIcon';
import { MedicamentoRow } from '@/components/medicamento/MedicamentoRow';
import {
  useCarrinhoStore,
  selectItensArray,
  selectTotalItens,
} from '@/features/pedidos/carrinho.store';
import { useCriarPedido } from '@/features/pedidos/pedidos.hooks';

export default function CarrinhoScreen() {
  const router = useRouter();
  const itens = useCarrinhoStore(selectItensArray);
  const totalItens = useCarrinhoStore(selectTotalItens);
  const setQty = useCarrinhoStore((s) => s.setQty);
  const clear = useCarrinhoStore((s) => s.clear);
  const criar = useCriarPedido();

  const handleSubmit = () => {
    if (itens.length === 0) return;
    criar.mutate(
      {
        itens: itens.map((i) => ({
          medicamentoId: i.medicamento.id,
          quantidade: i.quantidade,
          precoUnitario: Number(i.medicamento.precoUnitario),
        })),
      },
      {
        onSuccess: () => router.replace('/novo-pedido/confirmacao'),
        onError: (err) =>
          Alert.alert('Erro', (err as Error).message ?? 'Não foi possível enviar o pedido'),
      },
    );
  };

  const handleClear = () =>
    Alert.alert('Limpar pedido', 'Remover todos os itens?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: () => clear() },
    ]);

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
        <Text className="font-semibold text-base text-[#515151]">Pedido</Text>
        <Pressable onPress={handleClear} className="h-10 w-10 items-center justify-center active:opacity-60">
          <SolarIcon name="alt-arrow-down-linear" size={20} color="#9AA3B2" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 200 }} className="px-5">
        {itens.length === 0 ? (
          <View className="mt-16 items-center">
            <SolarIcon name="inbox-linear" size={48} color="#B3B3B3" />
            <Text className="mt-3 text-base text-ink-500">Seu pedido está vazio</Text>
            <Pressable
              onPress={() => router.back()}
              className="mt-6 rounded-pill bg-brand-500 px-6 py-3 active:opacity-80"
            >
              <Text className="font-semibold text-white">Adicionar Itens</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {itens.map((item, idx) => (
              <MedicamentoRow
                key={item.medicamento.id}
                medicamento={item.medicamento}
                trailing="edit"
                quantityLabel={String(item.quantidade)}
                onTrailingPress={() => setQty(item.medicamento.id, item.quantidade + 1)}
                dashed={idx !== itens.length - 1}
              />
            ))}
            <Pressable
              onPress={() => router.back()}
              className="mt-3 self-center active:opacity-60"
            >
              <Text className="font-medium text-sm text-[#858585]">+ Adicionar Mais Itens</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {/* Footer navy card */}
      {itens.length > 0 ? (
        <View className="absolute bottom-24 mx-auto self-center" style={{ width: 374 }}>
          <View className="rounded-card bg-brand-500 px-5 pb-7 pt-5">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-medium text-base text-white">{totalItens} Itens</Text>
                <Text className="mt-1 text-[10px] text-white">Total de Itens do Pedido</Text>
              </View>
              <Pressable
                onPress={handleSubmit}
                disabled={criar.isPending}
                className="h-[59px] w-[168px] flex-row items-center justify-between rounded-card bg-white/15 pl-4 pr-2.5 active:opacity-80"
                style={criar.isPending ? { opacity: 0.5 } : undefined}
              >
                <Text className="font-semibold text-sm text-white">
                  {criar.isPending ? 'Enviando...' : 'Enviar Pedido'}
                </Text>
                <View className="h-11 w-11 items-center justify-center rounded-pill bg-white/5">
                  <SolarIcon name="arrow-right-up-linear" size={17} color="#fff" />
                </View>
              </Pressable>
            </View>
            <Text className="mt-3 text-center text-[10px] leading-4 text-white/75">
              Por se tratar de um pedido personalizado, sua solicitação será analisada pela nossa equipe. A
              cotação, prazo de entrega e validação podem levar até 2 horas úteis.
            </Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
