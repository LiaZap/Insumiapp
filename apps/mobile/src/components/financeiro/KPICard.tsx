import { Text, View } from 'react-native';
import { SolarIcon, type SolarIconName } from '@/components/icons/SolarIcon';
import { colors } from '@/theme/tokens';

type Tone = 'pagar' | 'receber' | 'vencidas';

const TONE: Record<Tone, { bg: string; fg: string; icon: SolarIconName }> = {
  pagar: { bg: 'rgba(220,38,38,0.08)', fg: colors.danger, icon: 'arrow-right-up-linear' },
  receber: { bg: 'rgba(22,163,74,0.08)', fg: colors.success, icon: 'arrow-right-up-linear' },
  vencidas: { bg: 'rgba(245,158,11,0.1)', fg: colors.warning, icon: 'clock-circle-linear' },
};

function fmt(n: number) {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function KPICard({
  tone,
  label,
  valor,
  count,
}: {
  tone: Tone;
  label: string;
  valor?: number;
  count?: number;
}) {
  const cfg = TONE[tone];
  return (
    <View className="flex-1 rounded-card bg-white p-4">
      <View
        className="h-9 w-9 items-center justify-center rounded-icon"
        style={{ backgroundColor: cfg.bg }}
      >
        <SolarIcon name={cfg.icon} size={18} color={cfg.fg} />
      </View>
      <Text className="mt-3 text-xs text-ink-500">{label}</Text>
      {valor != null ? (
        <Text className="mt-1 font-semibold text-base text-ink-900" numberOfLines={1}>
          {fmt(valor)}
        </Text>
      ) : null}
      {count != null ? (
        <Text className="mt-1 font-bold text-2xl" style={{ color: cfg.fg }}>
          {count}
        </Text>
      ) : null}
    </View>
  );
}
