import { useEffect } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type SkeletonProps = ViewProps & {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  className?: string;
};

export function Skeleton({
  width,
  height = 16,
  radius = 8,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      className={['bg-brand-100', className ?? ''].join(' ')}
      style={[
        { width, height, borderRadius: radius, backgroundColor: '#C7D5EA' },
        animatedStyle,
        style,
      ]}
      {...(rest as View['props'])}
    />
  );
}
