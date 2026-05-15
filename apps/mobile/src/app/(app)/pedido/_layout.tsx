import { Stack } from 'expo-router';

export default function PedidoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F2F2F2' } }}>
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
