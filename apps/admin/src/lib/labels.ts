import { NEXT_STATUS_MANUAL, type PedidoStatus } from '@insumia/shared';

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

// Próximos status que o admin avança manualmente — fonte única no @insumia/shared
// (mesma usada pela API para validar a transição).
export const NEXT_STATUS = NEXT_STATUS_MANUAL;
