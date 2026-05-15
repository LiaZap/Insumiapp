import { Text, View } from 'react-native';
import { SolarIcon, type SolarIconName } from '@/components/icons/SolarIcon';
import { Button } from './Button';

type EmptyStateProps = {
  icon?: SolarIconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = 'inbox-linear',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="h-20 w-20 items-center justify-center rounded-card bg-brand-50">
        <SolarIcon name={icon} size={36} color="#1B498C" />
      </View>
      <Text className="mt-4 text-center font-semibold text-lg text-ink-900">{title}</Text>
      {description ? (
        <Text className="mt-2 max-w-xs text-center text-sm text-ink-500">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-6 w-full max-w-xs">
          <Button label={actionLabel} fullWidth onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
