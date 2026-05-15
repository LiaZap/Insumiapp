import { forwardRef } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, className, ...rest },
  ref,
) {
  return (
    <View className="w-full">
      {label ? (
        <Text className="mb-1.5 font-medium text-sm text-ink-900">{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#B3B3B3"
        className={[
          'h-14 rounded-pill border bg-surface-card px-5 text-base font-sans text-ink-900',
          error ? 'border-danger' : 'border-brand-100',
          className ?? '',
        ].join(' ')}
        {...rest}
      />
      {error ? (
        <Text className="mt-1 ml-2 text-xs text-danger">{error}</Text>
      ) : hint ? (
        <Text className="mt-1 ml-2 text-xs text-ink-400">{hint}</Text>
      ) : null}
    </View>
  );
});
