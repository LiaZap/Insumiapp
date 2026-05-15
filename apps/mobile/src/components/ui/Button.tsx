import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
};

const base = 'flex-row items-center justify-center rounded-pill active:opacity-80';
const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3',
  md: 'h-12 px-5',
  lg: 'h-14 px-6',
};
const variantBg: Record<Variant, string> = {
  primary: 'bg-brand-500',
  secondary: 'bg-surface-card border border-brand-100',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
};
const variantText: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-brand-500',
  ghost: 'text-brand-500',
  danger: 'text-white',
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={[
        base,
        sizeClasses[size],
        variantBg[variant],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50' : '',
        className ?? '',
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : '#1B498C'} />
      ) : (
        <Text className={`font-semibold ${variantText[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
