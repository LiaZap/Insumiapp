import { z } from 'zod';
import { medicamentoSchema } from './medicamento';
import { lanceSchema } from './fornecedor';

export const agrupamentoStatusSchema = z.enum([
  'aberto',
  'em_cotacao',
  'cotado',
  'finalizado',
  'cancelado',
]);
export type AgrupamentoStatus = z.infer<typeof agrupamentoStatusSchema>;

export const AGRUPAMENTO_STATUS_LABEL: Record<AgrupamentoStatus, string> = {
  aberto: 'Aberto',
  em_cotacao: 'Em cotação',
  cotado: 'Cotado',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

// Linha de detalhe — contribuição de cada clínica no agrupamento
export const agrupamentoLinhaSchema = z.object({
  itemId: z.string().uuid(),
  pedidoId: z.string().uuid(),
  pedidoNumero: z.string(),
  clinica: z.string(),
  quantidade: z.number().int(),
  criadoEm: z.string(),
});
export type AgrupamentoLinha = z.infer<typeof agrupamentoLinhaSchema>;

// Resumo (listagem)
export const agrupamentoResumoSchema = z.object({
  id: z.string().uuid(),
  numero: z.string(),
  status: agrupamentoStatusSchema,
  criadoEm: z.string(),
  fechadoEm: z.string().nullable().optional(),
  medicamento: medicamentoSchema.partial().extend({ id: z.string(), nome: z.string() }),
  totalPedidos: z.number().int(),
  totalVolume: z.number().int(),
});
export type AgrupamentoResumo = z.infer<typeof agrupamentoResumoSchema>;

// Detalhe
export const agrupamentoDetalheSchema = agrupamentoResumoSchema.extend({
  publicToken: z.string(),
  observacao: z.string().nullable().optional(),
  linhas: z.array(agrupamentoLinhaSchema),
  lances: z.array(lanceSchema),
});
export type AgrupamentoDetalhe = z.infer<typeof agrupamentoDetalheSchema>;
