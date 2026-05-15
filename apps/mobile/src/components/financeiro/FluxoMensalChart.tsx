import { Text, View } from 'react-native';
import type { DashboardFinanceiro } from '@insumia/shared';
import { colors } from '@/theme/tokens';

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function monthLabel(key: string) {
  const month = parseInt(key.split('-')[1] ?? '1', 10);
  return MONTH_LABELS[month - 1] ?? key;
}

function fmtCompact(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return v.toFixed(0);
}

export function FluxoMensalChart({ fluxo }: { fluxo: DashboardFinanceiro['fluxoMensal'] }) {
  const max = Math.max(
    1,
    ...fluxo.flatMap((m) => [Number(m.entradas), Number(m.saidas)]),
  );

  return (
    <View className="mx-5 rounded-card bg-brand-500 px-5 pb-5 pt-5">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="font-medium text-base text-white">Fluxo de Caixa</Text>
          <Text className="mt-1 text-xs text-white/50">Últimos 6 meses</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent[400] }} />
            <Text className="text-[10px] text-white/75">Entradas</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' }} />
            <Text className="text-[10px] text-white/75">Saídas</Text>
          </View>
        </View>
      </View>

      <View className="mt-5 h-[140px] flex-row items-end justify-between">
        {fluxo.map((m) => {
          const entradas = Number(m.entradas);
          const saidas = Number(m.saidas);
          const hEntradas = (entradas / max) * 120;
          const hSaidas = (saidas / max) * 120;
          return (
            <View key={m.mes} className="items-center" style={{ flex: 1 }}>
              <View className="flex-row items-end gap-1" style={{ height: 120 }}>
                <View
                  style={{
                    width: 8,
                    height: Math.max(2, hEntradas),
                    borderRadius: 4,
                    backgroundColor: colors.accent[400],
                  }}
                />
                <View
                  style={{
                    width: 8,
                    height: Math.max(2, hSaidas),
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.35)',
                  }}
                />
              </View>
              <Text className="mt-2 text-[10px] text-white/60">{monthLabel(m.mes)}</Text>
            </View>
          );
        })}
      </View>

      <View className="mt-4 flex-row justify-between border-t border-white/10 pt-3">
        <View>
          <Text className="text-[10px] text-white/50">Entradas</Text>
          <Text className="font-semibold text-sm text-white">
            R$ {fmtCompact(fluxo.reduce((s, m) => s + Number(m.entradas), 0))}
          </Text>
        </View>
        <View>
          <Text className="text-[10px] text-white/50">Saídas</Text>
          <Text className="font-semibold text-sm text-white">
            R$ {fmtCompact(fluxo.reduce((s, m) => s + Number(m.saidas), 0))}
          </Text>
        </View>
      </View>
    </View>
  );
}
