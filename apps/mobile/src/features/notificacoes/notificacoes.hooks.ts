import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificacoesApi } from './notificacoes.api';

export type { Notificacao } from '@insumia/shared';

const KEY = ['notificacoes'];

export function useNotificacoes() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => notificacoesApi.list(),
    staleTime: 30_000,
  });
}

export function useMarcarLida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificacoesApi.marcarLida(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useMarcarTodasLidas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificacoesApi.marcarTodasLidas(),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
