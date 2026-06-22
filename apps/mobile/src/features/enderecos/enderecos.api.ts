import { api } from '@/lib/api';
import type { AtualizarEnderecoInput, CriarEnderecoInput, Endereco } from '@insumia/shared';

export const enderecosApi = {
  list: async (): Promise<Endereco[]> => {
    const { data } = await api.get<Endereco[]>('/api/v1/enderecos');
    return data;
  },
  criar: async (dto: CriarEnderecoInput): Promise<Endereco> => {
    const { data } = await api.post<Endereco>('/api/v1/enderecos', dto);
    return data;
  },
  atualizar: async (id: string, dto: AtualizarEnderecoInput): Promise<Endereco> => {
    const { data } = await api.patch<Endereco>(`/api/v1/enderecos/${id}`, dto);
    return data;
  },
  remover: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/enderecos/${id}`);
  },
};
