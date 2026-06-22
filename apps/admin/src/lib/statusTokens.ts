/**
 * Fonte única de tokens de status para pedidos e contas financeiras.
 * Consumido por ui.tsx (Badge), charts.tsx (StatusDonut) e DashboardPage.tsx.
 */

export type StatusToken = {
  label: string;
  badgeClass: string;
  chartHex: string;
};

export const STATUS_TOKENS: Record<string, StatusToken> = {
  // Pedidos
  rascunho: {
    label: 'Rascunho',
    badgeClass: 'bg-gray-100 text-gray-600',
    chartHex: '#9AA3B2',
  },
  aguardando_cotacao: {
    label: 'Aguardando cotação',
    badgeClass: 'bg-brand-50 text-brand-600',
    chartHex: '#F59E0B',
  },
  cotado: {
    label: 'Cotado',
    badgeClass: 'bg-accent-200 text-brand-700',
    chartHex: '#5DDDF5',
  },
  confirmado: {
    label: 'Confirmado',
    badgeClass: 'bg-green-100 text-green-700',
    chartHex: '#16A34A',
  },
  em_separacao: {
    label: 'Em separação',
    badgeClass: 'bg-amber-100 text-amber-700',
    chartHex: '#A16207',
  },
  enviado: {
    label: 'Enviado',
    badgeClass: 'bg-blue-100 text-blue-700',
    chartHex: '#1D4ED8',
  },
  entregue: {
    label: 'Entregue',
    badgeClass: 'bg-green-100 text-green-700',
    chartHex: '#093A67',
  },
  cancelado: {
    label: 'Cancelado',
    badgeClass: 'bg-red-100 text-red-600',
    chartHex: '#DC2626',
  },
  // Contas financeiras
  aberta: {
    label: 'Aberta',
    badgeClass: 'bg-gray-100 text-gray-600',
    chartHex: '#9AA3B2',
  },
  paga: {
    label: 'Paga',
    badgeClass: 'bg-green-100 text-green-700',
    chartHex: '#16A34A',
  },
  vencida: {
    label: 'Vencida',
    badgeClass: 'bg-amber-100 text-amber-700',
    chartHex: '#F59E0B',
  },
  // Estoque
  ok: {
    label: 'OK',
    badgeClass: 'bg-green-100 text-green-700',
    chartHex: '#16A34A',
  },
  baixo: {
    label: 'Baixo',
    badgeClass: 'bg-amber-100 text-amber-700',
    chartHex: '#F59E0B',
  },
  esgotado: {
    label: 'Esgotado',
    badgeClass: 'bg-red-100 text-red-600',
    chartHex: '#DC2626',
  },
};

/** Retorna o badgeClass para um status, com fallback. */
export function getBadgeClass(status: string): string {
  return STATUS_TOKENS[status]?.badgeClass ?? 'bg-gray-100 text-gray-600';
}

/** Retorna o hex de gráfico para um status, com fallback. */
export function getChartHex(status: string): string {
  return STATUS_TOKENS[status]?.chartHex ?? '#9AA3B2';
}
