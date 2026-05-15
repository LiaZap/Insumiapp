import { useQuery } from '@tanstack/react-query';
import { usePedidos } from '@/features/pedidos/pedidos.hooks';

// MOCK por enquanto — em S4 ainda não criamos endpoint /notificacoes na API.
// Derivamos notificações dos pedidos existentes (status changes simulados).
export type Notificacao = {
  id: string;
  tipo: 'pedido' | 'alerta' | 'sistema';
  titulo: string;
  descricao: string;
  data: string;
  lida: boolean;
  pedidoId?: string;
};

export function useNotificacoes() {
  const { data: pedidos = [] } = usePedidos();

  return useQuery({
    queryKey: ['notificacoes', pedidos.map((p) => p.id).join(',')],
    queryFn: async (): Promise<Notificacao[]> => {
      // Gera notificação por pedido
      return pedidos.flatMap((p) => {
        const base: Notificacao[] = [
          {
            id: `${p.id}-created`,
            tipo: 'pedido',
            titulo: 'Recebemos seu pedido',
            descricao: `Pedido ${p.numero} está em análise. Cotação em até 2h úteis.`,
            data: p.criadoEm,
            lida: false,
            pedidoId: p.id,
          },
        ];
        if (p.status === 'confirmado' || p.status === 'enviado' || p.status === 'entregue') {
          base.push({
            id: `${p.id}-approved`,
            tipo: 'pedido',
            titulo: 'Pedido aprovado',
            descricao: `Pedido ${p.numero} foi aprovado e está sendo preparado.`,
            data: p.atualizadoEm,
            lida: false,
            pedidoId: p.id,
          });
        }
        return base;
      });
    },
    enabled: pedidos.length > 0,
    staleTime: 30_000,
  });
}
