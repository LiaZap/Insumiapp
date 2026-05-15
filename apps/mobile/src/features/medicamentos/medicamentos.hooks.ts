import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { MedicamentoCategoria } from '@insumia/shared';
import { medicamentosApi } from './medicamentos.api';

type Filter = {
  q?: string;
  categoria?: MedicamentoCategoria;
};

export function useMedicamentos(filter: Filter = {}) {
  return useQuery({
    queryKey: ['medicamentos', filter],
    queryFn: () => medicamentosApi.buscar({ ...filter, page: 1, perPage: 50 }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
