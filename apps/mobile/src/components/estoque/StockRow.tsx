import { Pressable, Text, View } from 'react-native';
import type { EstoqueResumo } from '@insumia/shared';
import { SolarIcon } from '@/components/icons/SolarIcon';
import { colors } from '@/theme/tokens';

type StockRowProps = {
  item: EstoqueResumo;
  onPress?: () => void;
  dashed?: boolean;
};

export function StockRow({ item, onPress, dashed = true }: StockRowProps) {
  const med = item.medicamento;
  const isSeringa = med.apresentacao?.toLowerCase().includes('seringa');
  const isLow = item.status === 'baixo' || item.status === 'esgotado';
  const subtitleParts = [med.apresentacao, med.dosagem].filter(Boolean);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-4 active:opacity-70"
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
        <View
          className="h-11 w-11 items-center justify-center rounded-icon"
          style={{ backgroundColor: isLow ? 'rgba(255,130,130,0.1)' : 'rgba(27,73,140,0.1)' }}
        >
          <SolarIcon
            name={isSeringa ? 'syringe-linear' : 'jar-of-pills-linear'}
            size={18}
            color={isLow ? '#FF8282' : colors.brand[500]}
          />
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="font-medium text-sm text-[#4A4A4A]">
            {med.nome}
            {subtitleParts.length > 0 ? ` • ${subtitleParts.join(' • ')}` : ''}
          </Text>
          <Text numberOfLines={1} className="mt-1 text-xs text-[#969696]">
            {med.fabricante ?? med.principioAtivo ?? ''}
          </Text>
        </View>
      </View>

      <View className="ml-2 flex-row items-center gap-2">
        <View
          className="h-9 items-center justify-center rounded-pill px-3"
          style={{ backgroundColor: isLow ? '#FF8282' : '#FFFFFF', minWidth: 60 }}
        >
          <Text
            className="font-semibold text-xs"
            style={{ color: isLow ? '#FFFFFF' : '#4A4A4A' }}
          >
            {item.quantidade}
          </Text>
        </View>
        <SolarIcon name="alt-arrow-down-linear" size={18} color="#9AA3B2" style={{ transform: [{ rotate: '-90deg' }] }} />
      </View>
    </Pressable>
  );
}
