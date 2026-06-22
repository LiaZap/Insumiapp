import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { LoginInput, SignupInput } from '@insumia/shared';
import { authApi } from './auth.api';
import { useAuthStore } from './auth.store';

type ApiError = AxiosError<{ message?: string }>;

function extractMessage(err: unknown): string {
  const e = err as ApiError;
  if (e.response?.data?.message) return e.response.data.message;
  // Erros de rede chegam aqui sem response (axios "Network Error", timeout, etc.)
  if (e.message === 'Network Error' || e.code === 'ERR_NETWORK') {
    return 'Não foi possível conectar ao servidor. Verifique sua internet e tente de novo.';
  }
  if (e.code === 'ECONNABORTED') {
    return 'O servidor demorou demais para responder. Tente de novo.';
  }
  return e.message ?? 'Erro inesperado';
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (dto: LoginInput) => authApi.login(dto),
    onSuccess: ({ user, accessToken, refreshToken }) =>
      setSession(user, accessToken, refreshToken ?? accessToken),
    onError: extractMessage,
  });
}

export function useSignup() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (dto: SignupInput) => authApi.signup(dto),
    onSuccess: ({ user, accessToken, refreshToken }) =>
      setSession(user, accessToken, refreshToken ?? accessToken),
    onError: extractMessage,
  });
}

export function useDeleteAccount() {
  const clearSession = useAuthStore((s) => s.clearSession);
  return useMutation({
    mutationFn: () => authApi.deleteAccount(),
    onSuccess: () => clearSession(),
    onError: extractMessage,
  });
}

export { extractMessage as extractAuthErrorMessage };
