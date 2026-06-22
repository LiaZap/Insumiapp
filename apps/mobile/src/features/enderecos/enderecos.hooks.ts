import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CriarEnderecoInput } from '@insumia/shared';
import { enderecosApi } from './enderecos.api';

export type { Endereco } from '@insumia/shared';

const KEY = ['enderecos'];

export function useEnderecos() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => enderecosApi.list(),
    staleTime: 60_000,
  });
}

export function useCriarEndereco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CriarEnderecoInput) => enderecosApi.criar(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRemoverEndereco() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => enderecosApi.remover(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDefinirPrincipal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => enderecosApi.atualizar(id, { principal: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
