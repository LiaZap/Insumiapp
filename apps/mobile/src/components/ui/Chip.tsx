import { Pressable, Text } from 'react-native';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={[
        'h-9 items-center justify-center rounded-pill px-4 active:opacity-80',
        selected ? 'bg-brand-500' : 'bg-surface-card',
      ].join(' ')}
    >
      <Text
        className={[
          'font-medium text-sm',
          selected ? 'text-white' : 'text-ink-500',
        ].join(' ')}
      >
        {label}
      </Text>
    </Pressable>
  );
}
