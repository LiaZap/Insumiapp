import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SolarIcon } from '@/components/icons/SolarIcon';

type Props = {
  totalValor: number;
  totalProdutos: number;
};

function formatMoney(v: number) {
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function EstoqueHeroCard({ totalValor, totalProdutos }: Props) {
  const router = useRouter();
  return (
    <View className="mx-5 rounded-card bg-brand-500 px-6 pb-6 pt-5">
      <View className="flex-row items-start justify-between">
        <Text className="font-medium text-sm text-white">
          Estoque <Text className="font-semibold">Insumia®</Text>
        </Text>
        <Pressable
          onPress={() => router.push('/movimentacoes')}
          className="h-11 w-11 items-center justify-center rounded-icon bg-brand-700 active:opacity-80"
        >
          <SolarIcon name="transfer-vertical-linear" size={20} color="#fff" />
        </Pressable>
      </View>
      <Text className="mt-5 font-medium text-2xl text-white">{formatMoney(totalValor)}</Text>
      <Text className="mt-1 font-sans text-sm text-white">{totalProdutos} produtos</Text>
    </View>
  );
}
