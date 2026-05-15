import { Text, View } from 'react-native';
import { colors } from '@/theme/tokens';

type FrequencyChartProps = {
  data?: number[];
  highlightIndex?: number;
  title?: string;
  subtitle?: string;
};

const DEFAULT_DATA = [
  94, 73, 63, 68, 73, 68, 80, 88, 88, 80, 80, 73, 63, 56, 63, 76, 76, 83, 94, 97, 97, 97, 97, 103,
  41, 97, 103, 97, 107, 107,
];

export function FrequencyChart({
  data = DEFAULT_DATA,
  highlightIndex = 24,
  title = 'Frequência de Uso',
  subtitle = 'Movimentações por dia',
}: FrequencyChartProps) {
  return (
    <View className="mx-5 rounded-card bg-brand-500 px-6 pb-6 pt-5">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="font-medium text-base text-white">{title}</Text>
          <Text className="mt-1 text-xs text-white/25">{subtitle}</Text>
        </View>
      </View>

      <View className="mt-6 h-[110px] flex-row items-end justify-between">
        {data.map((h, i) => (
          <View
            key={i}
            style={{
              width: 4,
              height: Math.max(20, h),
              borderRadius: 31,
              backgroundColor: i === highlightIndex ? colors.accent[400] : 'rgba(255,255,255,0.26)',
            }}
          />
        ))}
      </View>
    </View>
  );
}
