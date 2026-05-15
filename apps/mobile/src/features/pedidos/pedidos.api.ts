import { api } from '@/lib/api';
import type { CriarPedidoInput, Pedido } from '@insumia/shared';

export const pedidosApi = {
  list: async (): Promise<Pedido[]> => {
    const { data } = await api.get<Pedido[]>('/api/v1/pedidos');
    return data;
  },
  criar: async (dto: CriarPedidoInput): Promise<Pedido> => {
    const { data } = await api.post<Pedido>('/api/v1/pedidos', dto);
    return data;
  },
  aceitarCotacao: async (id: string): Promise<Pedido> => {
    const { data } = await api.post<Pedido>(`/api/v1/pedidos/${id}/cotacao/aceitar`);
    return data;
  },
  recusarCotacao: async (id: string): Promise<Pedido> => {
    const { data } = await api.post<Pedido>(`/api/v1/pedidos/${id}/cotacao/recusar`);
    return data;
  },
};
