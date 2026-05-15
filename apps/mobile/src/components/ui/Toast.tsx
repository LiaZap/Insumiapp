import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SolarIcon, type SolarIconName } from '@/components/icons/SolarIcon';
import { colors } from '@/theme/tokens';

type ToastVariant = 'success' | 'error' | 'info';

type ToastState = { message: string; variant: ToastVariant } | null;

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

const VARIANT: Record<ToastVariant, { bg: string; icon: SolarIconName }> = {
  success: { bg: colors.success, icon: 'file-check-bold-duotone' },
  error: { bg: colors.danger, icon: 'inbox-linear' },
  info: { bg: colors.brand[500], icon: 'bell-linear' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const translateY = useSharedValue(-120);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => setToast(null), []);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, variant });
      translateY.value = withSequence(
        withTiming(0, { duration: 280 }),
        withDelay(2600, withTiming(-120, { duration: 280 }, (done) => {
          if (done) runOnJS(hide)();
        })),
      );
    },
    [translateY, hide],
  );

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <Animated.View
          style={[{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 999 }, style]}
          pointerEvents="none"
        >
          <SafeAreaView edges={['top']}>
            <View
              style={{ backgroundColor: VARIANT[toast.variant].bg }}
              className="mx-4 mt-2 flex-row items-center gap-3 rounded-2xl px-4 py-3"
            >
              <SolarIcon name={VARIANT[toast.variant].icon} size={20} color="#fff" />
              <Text className="flex-1 font-medium text-sm text-white">{toast.message}</Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
