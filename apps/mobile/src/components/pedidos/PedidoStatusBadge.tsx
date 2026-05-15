import { Text, View } from 'react-native';
import type { PedidoStatus } from '@insumia/shared';
import { SolarIcon, type SolarIconName } from '@/components/icons/SolarIcon';
import { colors } from '@/theme/tokens';

const STATUS_MAP: Record<
  PedidoStatus,
  { label: string; icon: SolarIconName; bg: string; fg: string }
> = {
  rascunho: { label: 'Rascunho', icon: 'clipboard-add-linear', bg: '#EBEBEB', fg: '#737373' },
  aguardando_cotacao: {
    label: 'Aguardando',
    icon: 'clock-circle-linear',
    bg: 'rgba(27,73,140,0.25)',
    fg: '#1B498C',
  },
  cotado: { label: 'Cotado', icon: 'file-check-bold-duotone', bg: '#C9F4FF', fg: '#1B498C' },
  confirmado: { label: 'Aprovado', icon: 'home-2-bold', bg: '#DCFCE7', fg: '#16A34A' },
  em_separacao: { label: 'Separando', icon: 'box-bold-duotone', bg: '#FEF3C7', fg: '#A16207' },
  enviado: { label: 'Enviado', icon: 'arrow-right-up-linear', bg: '#DBEAFE', fg: '#1D4ED8' },
  entregue: { label: 'Entregue', icon: 'home-2-bold', bg: '#DCFCE7', fg: '#16A34A' },
  cancelado: { label: 'Cancelado', icon: 'inbox-linear', bg: '#FEE2E2', fg: '#DC2626' },
};

export function PedidoStatusBadge({
  status,
  size = 'md',
}: {
  status: PedidoStatus;
  size?: 'sm' | 'md';
}) {
  const cfg = STATUS_MAP[status];
  const sm = size === 'sm';
  return (
    <View
      style={{
        backgroundColor: cfg.bg,
        height: sm ? 24 : 30,
        paddingHorizontal: sm ? 8 : 10,
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <SolarIcon name={cfg.icon} size={sm ? 11 : 12} color={cfg.fg} />
      <Text
        style={{
          color: cfg.fg,
          fontSize: sm ? 9 : 10,
          fontFamily: 'Figtree_500Medium',
        }}
      >
        {cfg.label}
      </Text>
    </View>
  );
}

export const STATUS_LABEL: Record<PedidoStatus, string> = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([k, v]) => [k, v.label]),
) as Record<PedidoStatus, string>;

export { colors as _colors };
