import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ContaStatus, ContaTipo, CriarContaInput } from '@insumia/shared';
import { financeiroApi } from './financeiro.api';

export function useContas(filtro?: { tipo?: ContaTipo; status?: ContaStatus }) {
  return useQuery({
    queryKey: ['contas', filtro],
    queryFn: () => financeiroApi.list(filtro),
    staleTime: 30_000,
  });
}

export function useDashboardFinanceiro() {
  return useQuery({
    queryKey: ['dashboard-financeiro'],
    queryFn: () => financeiroApi.dashboard(),
    staleTime: 30_000,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['contas'] });
  qc.invalidateQueries({ queryKey: ['dashboard-financeiro'] });
}

export function useCriarConta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CriarContaInput) => financeiroApi.criar(dto),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useMarcarPaga() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeiroApi.pagar(id),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useCancelarConta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeiroApi.cancelar(id),
    onSuccess: () => invalidateAll(qc),
  });
}
