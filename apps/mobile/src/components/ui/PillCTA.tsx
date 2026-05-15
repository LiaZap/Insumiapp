import { Pressable, Text, View } from 'react-native';
import { SolarIcon } from '@/components/icons/SolarIcon';

type PillCTAProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'subtle';
  disabled?: boolean;
};

export function PillCTA({ label, onPress, variant = 'primary', disabled = false }: PillCTAProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={[
        'h-[70px] w-[170px] flex-row items-center justify-between rounded-pill pl-7 pr-2.5 active:opacity-80',
        variant === 'primary' ? 'bg-brand-500' : 'bg-white/15',
        disabled ? 'opacity-50' : '',
      ].join(' ')}
    >
      <Text className="font-semibold text-sm text-white">{label}</Text>
      <View className="h-11 w-11 items-center justify-center rounded-pill bg-black/30">
        <SolarIcon name="arrow-right-up-linear" size={18} color="#fff" />
      </View>
    </Pressable>
  );
}
