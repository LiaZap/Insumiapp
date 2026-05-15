import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signupSchema, type SignupInput } from '@insumia/shared';
import { useSignup, extractAuthErrorMessage } from '@/features/auth/auth.hooks';

export default function Signup() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const signup = useSignup();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { nome: '', email: '', password: '', empresa: '' },
  });

  const onSubmit = (data: SignupInput) => {
    setServerError(null);
    signup.mutate(data, {
      onSuccess: () => router.replace('/(app)/dashboard'),
      onError: (err) => setServerError(extractAuthErrorMessage(err)),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-base">
      <Stack.Screen options={{ headerShown: true, title: 'Criar conta' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-6 pt-6">
            <Text className="font-bold text-2xl text-brand-700">Crie sua conta</Text>
            <Text className="mt-1 text-base text-ink-500">
              Preencha seus dados para começar
            </Text>

            <View className="mt-8 gap-4">
              <Controller
                control={control}
                name="nome"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Nome completo"
                    placeholder="Seu nome"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.nome?.message}
                  />
                )}
              />
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
                name="empresa"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Empresa (opcional)"
                    placeholder="LifeMed Pinheiros"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.empresa?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Senha"
                    placeholder="Mínimo 8 caracteres"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message ?? serverError ?? undefined}
                  />
                )}
              />
            </View>

            <View className="mt-8">
              <Button
                label="Criar conta"
                fullWidth
                size="lg"
                loading={signup.isPending}
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
