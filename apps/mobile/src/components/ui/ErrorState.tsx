import { Text, View } from 'react-native';
import { SolarIcon } from '@/components/icons/SolarIcon';
import { Button } from './Button';

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Não foi possível carregar',
  description = 'Verifique sua conexão e tente novamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="h-20 w-20 items-center justify-center rounded-card bg-danger/10">
        <SolarIcon name="inbox-linear" size={36} color="#DC2626" />
      </View>
      <Text className="mt-4 text-center font-semibold text-lg text-ink-900">{title}</Text>
      <Text className="mt-2 max-w-xs text-center text-sm text-ink-500">{description}</Text>
      {onRetry ? (
        <View className="mt-6 w-full max-w-xs">
          <Button label="Tentar novamente" fullWidth onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}
