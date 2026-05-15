import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CriarMovimentacaoInput } from '@insumia/shared';
import { estoqueApi } from './estoque.api';

export function useEstoque() {
  return useQuery({
    queryKey: ['estoque'],
    queryFn: () => estoqueApi.resumo(),
    staleTime: 30_000,
  });
}

export function useMovimentacoes() {
  return useQuery({
    queryKey: ['movimentacoes'],
    queryFn: () => estoqueApi.movimentacoes(),
    staleTime: 30_000,
  });
}

export function useCriarMovimentacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CriarMovimentacaoInput) => estoqueApi.criarMovimentacao(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['estoque'] });
      qc.invalidateQueries({ queryKey: ['movimentacoes'] });
    },
  });
}
