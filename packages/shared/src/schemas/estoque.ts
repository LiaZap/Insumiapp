import { z } from 'zod';
import { medicamentoSchema } from './medicamento';

export const movimentacaoTipoSchema = z.enum([
  'entrada',
  'saida',
  'ajuste',
  'perda',
  'transferencia',
]);
export type MovimentacaoTipo = z.infer<typeof movimentacaoTipoSchema>;

export const MOVIMENTACAO_TIPO_LABEL: Record<MovimentacaoTipo, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  ajuste: 'Ajuste',
  perda: 'Perda',
  transferencia: 'Transferência',
};

export const estoqueStatusSchema = z.enum(['ok', 'baixo', 'esgotado']);
export type EstoqueStatus = z.infer<typeof estoqueStatusSchema>;

// Resumo retornado pelo GET /estoque — uma linha por medicamento (agregada)
export const estoqueResumoSchema = z.object({
  medicamento: medicamentoSchema.partial().extend({
    id: z.string().uuid(),
    nome: z.string(),
  }),
  quantidade: z.number().int(),
  status: estoqueStatusSchema,
  atualizadoEm: z.string().nullable(),
});
export type EstoqueResumo = z.infer<typeof estoqueResumoSchema>;

export const criarMovimentacaoSchema = z.object({
  medicamentoId: z.string().uuid(),
  tipo: movimentacaoTipoSchema,
  quantidade: z.number().int().min(1),
  lote: z.string().optional(),
  validade: z.string().datetime().optional(),
  motivo: z.string().max(280).optional(),
});
export type CriarMovimentacaoInput = z.infer<typeof criarMovimentacaoSchema>;

// Resposta da API — inclui medicamento e usuário aninhados
export const movimentacaoResponseSchema = z.object({
  id: z.string().uuid(),
  medicamentoId: z.string().uuid(),
  usuarioId: z.string().uuid(),
  tipo: movimentacaoTipoSchema,
  quantidade: z.number().int(),
  lote: z.string().nullable().optional(),
  validade: z.string().nullable().optional(),
  motivo: z.string().nullable().optional(),
  criadoEm: z.string(),
  medicamento: medicamentoSchema.partial().extend({
    id: z.string().uuid(),
    nome: z.string(),
  }),
  usuario: z.object({ id: z.string().uuid(), nome: z.string() }).optional(),
});
export type Movimentacao = z.infer<typeof movimentacaoResponseSchema>;
