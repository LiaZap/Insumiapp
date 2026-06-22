import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';

import { SolarIcon } from '@/components/icons/SolarIcon';
import { colors } from '@/theme/tokens';

const WHATSAPP_NUMERO = '5551920044576';
const EMAIL_SUPORTE = 'contato@bahtech.com.br';

export default function ForgotPassword() {
  const router = useRouter();

  const abrirWhatsApp = () =>
    Linking.openURL(
      `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
        'Olá, esqueci a senha do meu app Insumia. Pode me ajudar a redefinir?',
      )}`,
    );

  const abrirEmail = () =>
    Linking.openURL(
      `mailto:${EMAIL_SUPORTE}?subject=${encodeURIComponent(
        'Insumia — esqueci a senha',
      )}&body=${encodeURIComponent(
        'Olá, esqueci minha senha. Meu e-mail de cadastro é: ___\n\nObrigado.',
      )}`,
    );

  return (
    <SafeAreaView className="flex-1 bg-surface-base">
      <Stack.Screen options={{ headerShown: true, title: 'Esqueci minha senha' }} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <View className="items-center pt-6">
          <View className="h-20 w-20 items-center justify-center rounded-card bg-brand-50">
            <SolarIcon name="bell-linear" size={36} color={colors.brand[500]} />
          </View>
          <Text className="mt-5 text-center font-bold text-2xl text-brand-700">
            Esqueceu a senha?
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-ink-500">
            Por se tratar de uma plataforma B2B com cadastro validado, a redefinição
            de senha é feita com a nossa equipe. É rápido: respondemos em horário
            comercial.
          </Text>
        </View>

        <View className="mt-8 gap-3">
          <Pressable
            onPress={abrirWhatsApp}
            className="flex-row items-center gap-3 rounded-card bg-white px-4 py-4 active:opacity-80"
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-icon"
              style={{ backgroundColor: '#DCFCE7' }}
            >
              <SolarIcon name="chat-round-money-bold" size={22} color="#16A34A" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-sm text-ink-900">Falar pelo WhatsApp</Text>
              <Text className="mt-0.5 text-xs text-ink-500">+55 (51) 92004-4576</Text>
            </View>
            <SolarIcon name="arrow-right-up-linear" size={16} color="#9AA3B2" />
          </Pressable>

          <Pressable
            onPress={abrirEmail}
            className="flex-row items-center gap-3 rounded-card bg-white px-4 py-4 active:opacity-80"
          >
            <View className="h-12 w-12 items-center justify-center rounded-icon bg-brand-50">
              <SolarIcon name="bell-linear" size={22} color={colors.brand[500]} />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-sm text-ink-900">Enviar e-mail</Text>
              <Text className="mt-0.5 text-xs text-ink-500">{EMAIL_SUPORTE}</Text>
            </View>
            <SolarIcon name="arrow-right-up-linear" size={16} color="#9AA3B2" />
          </Pressable>
        </View>

        <View className="mt-8 rounded-card bg-brand-50 px-4 py-4">
          <Text className="text-xs leading-5 text-brand-700">
            <Text className="font-semibold">Dica:</Text> ao enviar a mensagem, inclua o
            e-mail cadastrado na sua conta. Nossa equipe gera uma senha provisória e
            envia para você em até 1 dia útil.
          </Text>
        </View>

        <Pressable
          onPress={() => router.back()}
          className="mt-10 self-center px-6 py-2 active:opacity-60"
        >
          <Text className="font-semibold text-sm text-brand-500">Voltar para o login</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
