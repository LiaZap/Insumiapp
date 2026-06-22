import { api } from '@/lib/api';
import type { Notificacao } from '@insumia/shared';

export const notificacoesApi = {
  list: async (): Promise<Notificacao[]> => {
    const { data } = await api.get<Notificacao[]>('/api/v1/notificacoes');
    return data;
  },
  marcarLida: async (id: string): Promise<void> => {
    await api.patch(`/api/v1/notificacoes/${id}/lida`);
  },
  marcarTodasLidas: async (): Promise<void> => {
    await api.post('/api/v1/notificacoes/lidas');
  },
};
