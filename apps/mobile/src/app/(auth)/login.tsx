import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SolarIcon } from '@/components/icons/SolarIcon';
import { loginSchema, type LoginInput } from '@insumia/shared';
import { useLogin, extractAuthErrorMessage } from '@/features/auth/auth.hooks';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const login = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginInput) => {
    setServerError(null);
    login.mutate(data, {
      onSuccess: () => router.replace('/(app)/dashboard'),
      onError: (err) => setServerError(extractAuthErrorMessage(err)),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-base">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 pt-10">
            <View className="mb-8 h-16 w-16 items-center justify-center rounded-card bg-brand-500">
              <SolarIcon name="jar-of-pills-linear" size={32} color="#fff" />
            </View>
            <Text className="font-bold text-3xl text-brand-700">Entrar</Text>
            <Text className="mt-1 text-base text-ink-500">Acesse sua conta Insumia</Text>

            <View className="mt-8 gap-4">
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="E-mail"
                    placeholder="seu@email.com"
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Senha"
                    placeholder="••••••••"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message ?? serverError ?? undefined}
                  />
                )}
              />
              <Link href="/(auth)/forgot-password" className="self-end font-medium text-sm text-brand-500">
                Esqueci minha senha
              </Link>
            </View>

            <View className="mt-8 gap-3">
              <Button
                label="Entrar"
                fullWidth
                size="lg"
                loading={login.isPending}
                onPress={handleSubmit(onSubmit)}
              />
              <View className="flex-row justify-center">
                <Text className="text-ink-500">Não tem conta? </Text>
                <Link href="/(auth)/signup" className="font-semibold text-brand-500">
                  Cadastre-se
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
