import { api } from '@/lib/api';
import type { BuscaMedicamentoInput, Medicamento } from '@insumia/shared';

type PaginatedResponse<T> = {
  data: T[];
  page: number;
  perPage: number;
  total: number;
};

export const medicamentosApi = {
  buscar: async (params: Partial<BuscaMedicamentoInput>): Promise<PaginatedResponse<Medicamento>> => {
    const { data } = await api.get<PaginatedResponse<Medicamento>>('/api/v1/medicamentos', {
      params,
    });
    return data;
  },
};
