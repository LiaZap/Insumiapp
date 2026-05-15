import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Pressable, type PressableProps } from 'react-native';

const AnimatedRNPressable = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = PressableProps & {
  scaleTo?: number;
  className?: string;
};

/** Pressable com feedback de escala — usar em cards e tiles. */
export function AnimatedPressable({
  scaleTo = 0.97,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedRNPressable
      style={style}
      onPressIn={(e) => {
        scale.value = withTiming(scaleTo, { duration: 90 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: 120 });
        onPressOut?.(e);
      }}
      {...rest}
    >
      {children}
    </AnimatedRNPressable>
  );
}
