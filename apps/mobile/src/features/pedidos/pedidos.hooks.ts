import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CriarPedidoInput, Pedido } from '@insumia/shared';
import { pedidosApi } from './pedidos.api';
import { api } from '@/lib/api';

export function usePedidos() {
  return useQuery({
    queryKey: ['pedidos'],
    queryFn: () => pedidosApi.list(),
    staleTime: 30_000,
  });
}

export function usePedido(id: string | undefined) {
  return useQuery({
    queryKey: ['pedido', id],
    queryFn: async (): Promise<Pedido> => {
      const { data } = await api.get<Pedido>(`/api/v1/pedidos/${id}`);
      return data;
    },
    enabled: Boolean(id),
    staleTime: 15_000,
  });
}

export function useCriarPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CriarPedidoInput) => pedidosApi.criar(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos'] }),
  });
}

export function useResponderCotacao(pedidoId: string | undefined) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['pedidos'] });
    qc.invalidateQueries({ queryKey: ['pedido', pedidoId] });
  };
  const aceitar = useMutation({
    mutationFn: () => pedidosApi.aceitarCotacao(pedidoId!),
    onSuccess: invalidate,
  });
  const recusar = useMutation({
    mutationFn: () => pedidosApi.recusarCotacao(pedidoId!),
    onSuccess: invalidate,
  });
  return { aceitar, recusar };
}
