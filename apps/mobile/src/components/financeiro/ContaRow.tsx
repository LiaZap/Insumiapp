import { Pressable, Text, View } from 'react-native';
import type { Conta } from '@insumia/shared';
import { SolarIcon, type SolarIconName } from '@/components/icons/SolarIcon';
import { colors } from '@/theme/tokens';

function fmt(v: number | string) {
  const n = typeof v === 'string' ? Number(v) : v;
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

const STATUS_CFG: Record<
  Conta['status'],
  { bg: string; fg: string; icon: SolarIconName; label: string }
> = {
  aberta: { bg: '#EEF1F5', fg: colors.brand[700], icon: 'clock-circle-linear', label: 'Aberta' },
  paga: { bg: '#DCFCE7', fg: colors.success, icon: 'file-check-bold-duotone', label: 'Paga' },
  vencida: { bg: '#FEF3C7', fg: colors.warning, icon: 'clock-circle-linear', label: 'Vencida' },
  cancelada: { bg: '#FEE2E2', fg: colors.danger, icon: 'inbox-linear', label: 'Cancelada' },
};

export function ContaRow({ conta, onPress }: { conta: Conta; onPress?: () => void }) {
  const cfg = STATUS_CFG[conta.status];
  const isPagar = conta.tipo === 'pagar';
  const valorColor = isPagar ? colors.danger : colors.success;
  const sign = isPagar ? '-' : '+';

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-card bg-white px-4 py-4 active:opacity-70"
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-icon"
          style={{ backgroundColor: cfg.bg }}
        >
          <SolarIcon name={cfg.icon} size={18} color={cfg.fg} />
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="font-medium text-sm text-ink-900">
            {conta.descricao}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <Text className="text-xs text-ink-500">Venc {formatDate(conta.vencimento)}</Text>
            <View
              className="h-5 rounded-pill px-2"
              style={{ backgroundColor: cfg.bg, justifyContent: 'center' }}
            >
              <Text style={{ color: cfg.fg, fontSize: 10, fontFamily: 'Figtree_600SemiBold' }}>
                {cfg.label}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <Text className="font-semibold text-sm" style={{ color: valorColor }}>
        {sign}
        {fmt(conta.valor)}
      </Text>
    </Pressable>
  );
}
