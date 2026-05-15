import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { SolarIcon } from '@/components/icons/SolarIcon';
import { FrequencyChart } from '@/components/estoque/FrequencyChart';
import { MovimentacaoRow } from '@/components/estoque/MovimentacaoRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMovimentacoes } from '@/features/estoque/estoque.hooks';
import { colors } from '@/theme/tokens';

export default function MovimentacoesScreen() {
  const router = useRouter();
  const { data, isLoading } = useMovimentacoes();

  // Stats placeholder (em produção viria do backend)
  const avgPorDia = (data ?? []).length > 0 ? Math.max(1, Math.round((data?.length ?? 0) / 7)) : 0;

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
        <Text className="font-semibold text-base text-[#515151]">Movimentações</Text>
        <View className="h-10 w-10" />
      </View>

      {isLoading ? (
        <View className="gap-3 px-5">
          <Skeleton width="100%" height={230} radius={30} />
          <Skeleton width="100%" height={182} radius={30} />
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(m) => m.id}
          ListHeaderComponent={
            <View>
              <FrequencyChart subtitle="Movimentações por dia" />
              <View className="mt-3 mx-5 flex-row gap-3">
                <View
                  className="flex-1 rounded-card p-5"
                  style={{ backgroundColor: 'rgba(0,0,0,0.07)', minHeight: 182 }}
                >
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-100">
                    <SolarIcon name="user-bold" size={16} color={colors.brand[700]} />
                  </View>
                  <Text className="mt-auto font-semibold text-base text-brand-900">
                    {avgPorDia} retiradas por dia em média
                  </Text>
                  <Pressable className="mt-3 flex-row items-center justify-between">
                    <Text className="font-medium text-xs text-brand-900">Informar Uso</Text>
                    <SolarIcon
                      name="arrow-right-up-linear"
                      size={14}
                      color={colors.brand[900]}
                    />
                  </Pressable>
                </View>
                <View
                  className="flex-1 rounded-card bg-white p-5"
                  style={{ minHeight: 182 }}
                >
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-brand-100">
                    <SolarIcon name="user-bold" size={16} color={colors.brand[700]} />
                  </View>
                  <Text className="mt-auto font-semibold text-base text-brand-900">Permissões</Text>
                  <Text className="mt-1 text-xs text-brand-900/40">
                    Quem pode fazer retiradas e inclusões
                  </Text>
                  <Pressable className="mt-3 flex-row items-center justify-between">
                    <Text className="font-medium text-xs text-brand-900">Detalhes</Text>
                    <SolarIcon
                      name="arrow-right-up-linear"
                      size={14}
                      color={colors.brand[900]}
                    />
                  </Pressable>
                </View>
              </View>
              <Text className="mt-6 mb-1 px-5 text-xs font-medium text-ink-500">
                Histórico Recente
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View className="px-5">
              <MovimentacaoRow mov={item} dashed={index !== (data?.length ?? 0) - 1} />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="transfer-vertical-linear"
              title="Sem movimentações ainda"
              description="As movimentações aparecerão aqui quando você registrar entradas, saídas ou ajustes no estoque."
            />
          }
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
