import { api } from '@/lib/api';
import type { Conta, ContaStatus, ContaTipo, CriarContaInput, DashboardFinanceiro } from '@insumia/shared';

export const financeiroApi = {
  list: async (filtro?: { tipo?: ContaTipo; status?: ContaStatus }): Promise<Conta[]> => {
    const { data } = await api.get<Conta[]>('/api/v1/financeiro/contas', { params: filtro });
    return data;
  },
  criar: async (dto: CriarContaInput): Promise<Conta> => {
    const { data } = await api.post<Conta>('/api/v1/financeiro/contas', dto);
    return data;
  },
  pagar: async (id: string): Promise<Conta> => {
    const { data } = await api.patch<Conta>(`/api/v1/financeiro/contas/${id}/pagar`);
    return data;
  },
  cancelar: async (id: string): Promise<Conta> => {
    const { data } = await api.patch<Conta>(`/api/v1/financeiro/contas/${id}/cancelar`);
    return data;
  },
  dashboard: async (): Promise<DashboardFinanceiro> => {
    const { data } = await api.get<DashboardFinanceiro>('/api/v1/financeiro/dashboard');
    return data;
  },
};
