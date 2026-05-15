import { api } from '@/lib/api';
import type { CriarMovimentacaoInput, EstoqueResumo, Movimentacao } from '@insumia/shared';

export const estoqueApi = {
  resumo: async (): Promise<EstoqueResumo[]> => {
    const { data } = await api.get<EstoqueResumo[]>('/api/v1/estoque');
    return data;
  },
  movimentacoes: async (): Promise<Movimentacao[]> => {
    const { data } = await api.get<Movimentacao[]>('/api/v1/estoque/movimentacoes');
    return data;
  },
  criarMovimentacao: async (dto: CriarMovimentacaoInput): Promise<Movimentacao> => {
    const { data } = await api.post<Movimentacao>('/api/v1/estoque/movimentacoes', dto);
    return data;
  },
};
