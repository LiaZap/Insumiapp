import { Text, View } from 'react-native';
import type { Movimentacao } from '@insumia/shared';
import { SolarIcon } from '@/components/icons/SolarIcon';
import { colors } from '@/theme/tokens';

const TIPOS_SAIDA = new Set(['saida', 'perda', 'transferencia']);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function MovimentacaoRow({ mov, dashed = true }: { mov: Movimentacao; dashed?: boolean }) {
  const med = mov.medicamento;
  const isSaida = TIPOS_SAIDA.has(mov.tipo);
  const sign = isSaida ? '-' : '+';
  const color = isSaida ? 'rgba(255,130,130,0.97)' : '#16A34A';
  const usuarioNome = mov.usuario?.nome ?? 'Usuário';
  const subtitleParts = [med.apresentacao, med.dosagem].filter(Boolean);

  return (
    <View
      className="flex-row items-center justify-between py-4"
      style={
        dashed
          ? {
              borderBottomWidth: 1,
              borderStyle: 'dashed',
              borderBottomColor: '#E0E0E0',
            }
          : undefined
      }
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-icon bg-brand-500/10">
          <SolarIcon
            name={med.apresentacao?.toLowerCase().includes('seringa') ? 'syringe-linear' : 'jar-of-pills-linear'}
            size={18}
            color={colors.brand[500]}
          />
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="font-medium text-sm text-[#4A4A4A]">
            {med.nome}
            {subtitleParts.length > 0 ? ` • ${subtitleParts.join(' • ')}` : ''}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <View
              className="h-4 w-4 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.brand[100] }}
            >
              <Text className="font-semibold text-[8px]" style={{ color: colors.brand[700] }}>
                {initials(usuarioNome)}
              </Text>
            </View>
            <Text className="text-[10px] text-[#212121]">
              {usuarioNome} • {formatDate(mov.criadoEm)}
            </Text>
          </View>
        </View>
      </View>

      <View className="ml-2 flex-row items-center gap-2">
        <Text className="font-semibold text-xs" style={{ color }}>
          {sign}
          {String(mov.quantidade).padStart(2, '0')}
        </Text>
        <SolarIcon
          name="alt-arrow-down-linear"
          size={18}
          color="#9AA3B2"
          style={{ transform: [{ rotate: '-90deg' }] }}
        />
      </View>
    </View>
  );
}
