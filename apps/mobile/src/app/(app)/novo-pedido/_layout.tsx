import { Stack } from 'expo-router';

export default function NovoPedidoLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F2F2F2' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="carrinho" />
      <Stack.Screen name="confirmacao" />
    </Stack>
  );
}
