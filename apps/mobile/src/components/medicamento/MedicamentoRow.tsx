import { Pressable, Text, View } from 'react-native';
import type { Medicamento } from '@insumia/shared';
import { SolarIcon } from '@/components/icons/SolarIcon';

type MedicamentoRowProps = {
  medicamento: Medicamento;
  trailing?: 'menu' | 'quantity' | 'edit';
  quantityLabel?: string;
  onPress?: () => void;
  onTrailingPress?: () => void;
  dashed?: boolean;
};

export function MedicamentoRow({
  medicamento,
  trailing = 'menu',
  quantityLabel,
  onPress,
  onTrailingPress,
  dashed = true,
}: MedicamentoRowProps) {
  const isSeringa = medicamento.apresentacao?.toLowerCase().includes('seringa');
  const subtitleParts = [medicamento.apresentacao, medicamento.dosagem].filter(Boolean);
  const fabricante =
    medicamento.fabricante ?? medicamento.principioAtivo ?? '';

  return (
    <Pressable
      onPress={onPress}
      className="w-full flex-row items-center justify-between py-4 active:opacity-70"
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
        <View className="h-11 w-11 items-center justify-center rounded-icon bg-[#EBEBEB]">
          <SolarIcon
            name={isSeringa ? 'syringe-linear' : 'jar-of-pills-linear'}
            size={18}
            color="#4A4A4A"
          />
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="font-medium text-sm text-[#4A4A4A]">
            {medicamento.nome}
            {subtitleParts.length > 0 ? ` • ${subtitleParts.join(' • ')}` : ''}
          </Text>
          <Text numberOfLines={1} className="mt-1.5 text-xs text-[#969696]">
            {fabricante}
          </Text>
        </View>
      </View>

      <View className="ml-2 flex-row items-center gap-3">
        {quantityLabel ? (
          <View className="h-10 min-w-[54px] items-center justify-center rounded-pill bg-[#EBEBEB] px-3">
            <Text className="font-semibold text-xs text-[#4A4A4A]">{quantityLabel}</Text>
          </View>
        ) : null}
        <Pressable onPress={onTrailingPress} className="h-6 w-6 items-center justify-center">
          <SolarIcon
            name={trailing === 'edit' ? 'add-square-bold-duotone' : 'alt-arrow-down-linear'}
            size={20}
            color="#9AA3B2"
          />
        </Pressable>
      </View>
    </Pressable>
  );
}
