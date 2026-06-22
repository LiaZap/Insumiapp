import { api } from '@/lib/api';
import type { AtualizarPerfilInput, LoginInput, SignupInput, User } from '@insumia/shared';

type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken?: string;
};

export const authApi = {
  login: async (dto: LoginInput): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/api/v1/auth/login', dto);
    return data;
  },
  signup: async (dto: SignupInput): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/api/v1/auth/signup', dto);
    return data;
  },
  atualizarPerfil: async (dto: AtualizarPerfilInput): Promise<User> => {
    const { data } = await api.patch<User>('/api/v1/auth/me', dto);
    return data;
  },
  deleteAccount: async (): Promise<void> => {
    await api.delete('/api/v1/auth/me');
  },
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/api/v1/auth/forgot-password', { email });
  },
};
