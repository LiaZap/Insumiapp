import { Text, View } from 'react-native';
import type { PedidoStatus } from '@insumia/shared';
import { SolarIcon } from '@/components/icons/SolarIcon';
import { colors } from '@/theme/tokens';

const STEPS: Array<{ status: PedidoStatus; label: string }> = [
  { status: 'aguardando_cotacao', label: 'Aguardando Análise' },
  { status: 'cotado', label: 'Cotação Enviada' },
  { status: 'confirmado', label: 'Aprovado' },
  { status: 'em_separacao', label: 'Em Separação' },
  { status: 'enviado', label: 'Enviado' },
  { status: 'entregue', label: 'Entregue' },
];

function getStepIndex(status: PedidoStatus) {
  return STEPS.findIndex((s) => s.status === status);
}

export function StatusTimeline({ status }: { status: PedidoStatus }) {
  const currentIdx = getStepIndex(status);
  if (status === 'cancelado') {
    return (
      <View className="mt-4 flex-row items-center gap-2 rounded-icon bg-danger/10 p-3">
        <SolarIcon name="inbox-linear" size={18} color={colors.danger} />
        <Text className="font-medium text-sm" style={{ color: colors.danger }}>
          Pedido cancelado
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-2">
      {STEPS.map((step, idx) => {
        const isPast = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isLast = idx === STEPS.length - 1;
        return (
          <View key={step.status} className="flex-row">
            <View className="items-center" style={{ width: 24 }}>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: isPast || isCurrent ? colors.brand[500] : '#EBEBEB',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isPast ? (
                  <SolarIcon name="file-check-bold-duotone" size={10} color="#fff" />
                ) : isCurrent ? (
                  <View
                    style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }}
                  />
                ) : null}
              </View>
              {!isLast ? (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 24,
                    backgroundColor: isPast ? colors.brand[500] : '#EBEBEB',
                    marginTop: 2,
                  }}
                />
              ) : null}
            </View>
            <View className="ml-3 flex-1 pb-5">
              <Text
                className={[
                  'text-sm',
                  isCurrent
                    ? 'font-semibold text-brand-500'
                    : isPast
                    ? 'font-medium text-ink-700'
                    : 'font-medium text-ink-400',
                ].join(' ')}
              >
                {step.label}
              </Text>
              {isCurrent ? (
                <Text className="mt-1 text-xs text-ink-500">Em andamento</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
