import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function ForgotPassword() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: true, title: 'Esqueci minha senha' }} />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-bold text-neutral-900">Recuperar senha</Text>
        <Text className="mt-2 text-center text-neutral-600">
          Tela a implementar — envio de e-mail de recuperação.
        </Text>
      </View>
    </SafeAreaView>
  );
}
