import { Pressable, Text, View } from 'react-native';
import type { Pedido } from '@insumia/shared';
import { SolarIcon } from '@/components/icons/SolarIcon';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors } from '@/theme/tokens';
import { PedidoStatusBadge } from './PedidoStatusBadge';

type PedidoCardProps = {
  pedido: Pedido;
  variant?: 'featured' | 'compact';
  onPress?: () => void;
};

function formatMoney(v: number) {
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function itensSummary(pedido: Pedido) {
  if (!pedido.itens || pedido.itens.length === 0) return '';
  const names = pedido.itens.slice(0, 2).map((i) => i.medicamento?.nome ?? '');
  const extra = pedido.itens.length - 2;
  return `${names.filter(Boolean).join(', ')}${extra > 0 ? ` e mais ${extra} itens` : ''}`;
}

export function PedidoCard({ pedido, variant = 'compact', onPress }: PedidoCardProps) {
  const total = Number(pedido.total);
  const summary = itensSummary(pedido);

  if (variant === 'featured') {
    return (
      <AnimatedPressable
        onPress={onPress}
        className="rounded-pill bg-white px-5 pb-5 pt-5"
        style={{ borderRadius: 31 }}
      >
        <View className="flex-row items-start justify-between">
          <View className="h-12 w-12 items-center justify-center rounded-icon bg-brand-500/10">
            <SolarIcon name="box-bold-duotone" size={22} color={colors.brand[500]} />
          </View>
          <PedidoStatusBadge status={pedido.status} />
        </View>

        <View className="mt-5 flex-row items-end justify-between">
          <View className="flex-1">
            <Text className="font-medium text-base text-[#4A4A4A]">Pedido {pedido.numero}</Text>
            <Text numberOfLines={1} className="mt-1 text-[10px] text-[#969696]">
              {summary}
            </Text>
          </View>
          <Text className="font-medium text-sm text-black">{formatMoney(total)}</Text>
        </View>

        <View className="mt-1 flex-row items-end justify-between">
          <View />
          <Text className="text-[10px] text-[#969696]">{formatDate(pedido.criadoEm)}</Text>
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <Pressable onPress={onPress} className="flex-row items-center py-3 active:opacity-70">
      <View className="h-11 w-11 items-center justify-center rounded-icon bg-brand-500/10">
        <SolarIcon name="box-linear" size={20} color={colors.brand[500]} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-medium text-sm text-[#4A4A4A]">Pedido {pedido.numero}</Text>
        <Text numberOfLines={1} className="mt-1 text-[10px] text-[#969696]">
          {summary}
        </Text>
      </View>
      <View className="ml-2 items-end">
        <Text className="font-medium text-sm text-black">{formatMoney(total)}</Text>
        <Text className="mt-1 text-[10px] text-[#969696]">{formatDate(pedido.criadoEm)}</Text>
      </View>
    </Pressable>
  );
}
