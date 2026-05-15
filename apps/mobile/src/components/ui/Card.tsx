import { View, type ViewProps } from 'react-native';

type CardProps = ViewProps & { className?: string; tone?: 'light' | 'dark' };

export function Card({ className, tone = 'light', ...rest }: CardProps) {
  const bg = tone === 'dark' ? 'bg-surface-dark' : 'bg-surface-card';
  return (
    <View className={[`rounded-card ${bg} p-5`, className ?? ''].join(' ')} {...rest} />
  );
}
