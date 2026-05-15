import type { PedidoStatus } from '@insumia/shared';

export const STATUS_LABEL: Record<PedidoStatus, string> = {
  rascunho: 'Rascunho',
  aguardando_cotacao: 'Aguardando cotação',
  cotado: 'Cotado',
  confirmado: 'Aprovado',
  em_separacao: 'Em separação',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

// Próximos status que o admin avança manualmente.
// aguardando_cotacao e cotado são tratados pelo Motor de Cotação (não manuais).
export const NEXT_STATUS: Record<PedidoStatus, PedidoStatus[]> = {
  rascunho: ['aguardando_cotacao', 'cancelado'],
  aguardando_cotacao: [],
  cotado: [],
  confirmado: ['em_separacao', 'cancelado'],
  em_separacao: ['enviado'],
  enviado: ['entregue'],
  entregue: [],
  cancelado: [],
};
