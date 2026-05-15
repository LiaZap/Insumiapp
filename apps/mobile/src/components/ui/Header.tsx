import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SolarIcon } from '@/components/icons/SolarIcon';

type HeaderProps = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightSlot?: React.ReactNode;
};

export function Header({ title, subtitle, showBack = false, rightSlot }: HeaderProps) {
  const router = useRouter();
  return (
    <View className="flex-row items-center justify-between px-5 pb-3 pt-1">
      <View className="flex-row items-center gap-3">
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-surface-card active:opacity-80"
          >
            <SolarIcon name="alt-arrow-down-linear" size={20} color="#1B498C" style={{ transform: [{ rotate: '90deg' }] }} />
          </Pressable>
        ) : null}
        <View>
          {subtitle ? <Text className="font-sans text-xs text-ink-500">{subtitle}</Text> : null}
          {title ? (
            <Text className="font-semibold text-lg text-ink-900">{title}</Text>
          ) : null}
        </View>
      </View>
      {rightSlot ?? null}
    </View>
  );
}
