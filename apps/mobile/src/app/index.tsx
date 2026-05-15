import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth/auth.store';
import { storage, StorageKeys } from '@/lib/storage';

export default function Index() {
  const user = useAuthStore((s) => s.user);
  const onboardingSeen = storage.getBoolean(StorageKeys.onboardingSeen) ?? false;

  if (!onboardingSeen) return <Redirect href="/(auth)/onboarding" />;
  if (!user) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(app)/dashboard" />;
}
