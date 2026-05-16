import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';

import { Button } from '@/components/ui/Button';
import { useCarrinhoStore } from '@/features/pedidos/carrinho.store';
import { colors } from '@/theme/tokens';

function CheckCircle({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill="#FFFFFF" />
      <Path
        d="M8 12l3 3 5-6"
        stroke={colors.brand[500]}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export default function ConfirmacaoScreen() {
  const router = useRouter();
  const clear = useCarrinhoStore((s) => s.clear);

  // Limpa carrinho ao chegar nessa tela (pedido já foi criado)
  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <SafeAreaView className="flex-1 bg-brand-500">
      <View className="flex-1 items-center justify-center px-8">
        <CheckCircle size={96} />
        <Text className="mt-6 text-center font-semibold text-2xl text-white">
          Pedido Enviado!
        </Text>
        <Text className="mt-3 text-center text-sm leading-5 text-white/75">
          Sua solicitação foi enviada à equipe Insumia. A cotação será concluída em até 2 horas úteis.
          Você receberá uma notificação assim que estiver disponível.
        </Text>
      </View>

      <View className="px-6 pb-10 gap-3">
        <Pressable
          onPress={() => router.replace('/pedidos')}
          className="h-14 items-center justify-center rounded-pill bg-white active:opacity-80"
        >
          <Text className="font-semibold text-brand-500">Ver Meus Pedidos</Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace('/dashboard')}
          className="h-12 items-center justify-center active:opacity-60"
        >
          <Text className="font-medium text-sm text-white/75">Voltar ao Início</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
