import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { SolarIcon } from '@/components/icons/SolarIcon';
import { authApi } from '@/features/auth/auth.api';
import { colors } from '@/theme/tokens';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = useMutation({
    mutationFn: (e: string) => authApi.forgotPassword(e),
    onSuccess: () => setEnviado(true),
    onError: () =>
      setErro('Não conseguimos processar agora. Tente novamente em alguns instantes.'),
  });

  const handleSubmit = () => {
    setErro(null);
    const limpo = email.trim().toLowerCase();
    if (!limpo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo)) {
      setErro('Informe um e-mail válido.');
      return;
    }
    enviar.mutate(limpo);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-base">
      <Stack.Screen options={{ headerShown: true, title: 'Esqueci minha senha' }} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        {enviado ? (
          <View className="items-center pt-6">
            <View className="h-20 w-20 items-center justify-center rounded-card bg-green-100">
              <SolarIcon name="file-check-bold-duotone" size={36} color="#16A34A" />
            </View>
            <Text className="mt-5 text-center font-bold text-2xl text-brand-700">
              E-mail enviado
            </Text>
            <Text className="mt-3 text-center text-sm leading-5 text-ink-500">
              Se houver uma conta com o e-mail informado, você receberá em instantes um link
              para redefinir sua senha. O link é válido por 1 hora.
            </Text>
            <Text className="mt-4 text-center text-xs leading-5 text-ink-400">
              Não chegou em alguns minutos? Confira a caixa de spam ou tente novamente.
            </Text>
            <Pressable
              onPress={() => router.replace('/(auth)/login')}
              className="mt-8 rounded-pill bg-brand-500 px-8 py-3 active:opacity-80"
            >
              <Text className="font-semibold text-sm text-white">Voltar para o login</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View className="items-center pt-6">
              <View className="h-20 w-20 items-center justify-center rounded-card bg-brand-50">
                <SolarIcon name="bell-linear" size={36} color={colors.brand[500]} />
              </View>
              <Text className="mt-5 text-center font-bold text-2xl text-brand-700">
                Esqueceu a senha?
              </Text>
              <Text className="mt-2 text-center text-sm leading-5 text-ink-500">
                Informe o e-mail cadastrado e enviaremos um link para criar uma nova senha.
              </Text>
            </View>

            <View className="mt-8">
              <Text className="mb-1.5 text-[13px] font-semibold text-ink-700">E-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com.br"
                placeholderTextColor="#B3B3B3"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                className="rounded-card border border-black/10 bg-white px-4 py-3.5 text-base text-ink-900"
              />
              {erro ? (
                <Text className="mt-2 text-xs text-danger">{erro}</Text>
              ) : null}
            </View>

            <View className="mt-6">
              <Button
                label={enviar.isPending ? 'Enviando...' : 'Enviar link'}
                fullWidth
                size="lg"
                loading={enviar.isPending}
                onPress={handleSubmit}
              />
            </View>

            <Pressable
              onPress={() => router.back()}
              className="mt-8 self-center px-6 py-2 active:opacity-60"
            >
              <Text className="font-semibold text-sm text-brand-500">Voltar para o login</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
