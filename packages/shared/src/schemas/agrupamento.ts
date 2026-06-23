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

export const buscaAgrupamentoSchema = z.object({
  status: agrupamentoStatusSchema.optional(),
});
export type BuscaAgrupamentoInput = z.infer<typeof buscaAgrupamentoSchema>;

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

// Rastreabilidade — dados da compra (Vigilância Sanitária)
export const rastreabilidadeSchema = z.object({
  lote: z.string().nullable().optional(),
  validade: z.string().nullable().optional(),
  fabricante: z.string().nullable().optional(),
  notaFiscal: z.string().nullable().optional(),
  fornecedor: z.string().nullable().optional(),
  finalizadoEm: z.string().nullable().optional(),
});
export type Rastreabilidade = z.infer<typeof rastreabilidadeSchema>;

export const finalizarAgrupamentoSchema = z.object({
  lote: z.string().min(1, 'Informe o lote'),
  validade: z.string().datetime().optional(),
  fabricante: z.string().optional(),
  notaFiscal: z.string().optional(),
});
export type FinalizarAgrupamentoInput = z.infer<typeof finalizarAgrupamentoSchema>;

// Rastreabilidade estruturada (entidades) — preenchida nas compras finalizadas.
export const loteSchema = z.object({
  id: z.string().uuid(),
  numero: z.string(),
  validade: z.string().nullable().optional(),
  fabricante: z.string().nullable().optional(),
  criadoEm: z.string(),
});
export type Lote = z.infer<typeof loteSchema>;

export const notaFiscalSchema = z.object({
  id: z.string().uuid(),
  numero: z.string(),
  serie: z.string().nullable().optional(),
  valor: z.union([z.string(), z.number()]).nullable().optional(),
  emitidaEm: z.string().nullable().optional(),
  fornecedorId: z.string().uuid().nullable().optional(),
  criadoEm: z.string(),
});
export type NotaFiscal = z.infer<typeof notaFiscalSchema>;

// Detalhe
export const agrupamentoDetalheSchema = agrupamentoResumoSchema.extend({
  publicToken: z.string(),
  observacao: z.string().nullable().optional(),
  linhas: z.array(agrupamentoLinhaSchema),
  lances: z.array(lanceSchema),
  rastreabilidade: rastreabilidadeSchema.nullable().optional(),
  lotes: z.array(loteSchema).optional(),
  notasFiscais: z.array(notaFiscalSchema).optional(),
});
export type AgrupamentoDetalhe = z.infer<typeof agrupamentoDetalheSchema>;
