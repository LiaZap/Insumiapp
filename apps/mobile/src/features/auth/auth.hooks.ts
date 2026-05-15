import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { LoginInput, SignupInput } from '@insumia/shared';
import { authApi } from './auth.api';
import { useAuthStore } from './auth.store';

type ApiError = AxiosError<{ message?: string }>;

function extractMessage(err: unknown): string {
  const e = err as ApiError;
  return e.response?.data?.message ?? e.message ?? 'Erro inesperado';
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

export { extractMessage as extractAuthErrorMessage };
