import { z } from 'zod';
import { moneySchema } from './common';
import { medicamentoSchema } from './medicamento';

export const pedidoStatusSchema = z.enum([
  'rascunho',
  'aguardando_cotacao',
  'cotado',
  'confirmado',
  'em_separacao',
  'enviado',
  'entregue',
  'cancelado',
]);
export type PedidoStatus = z.infer<typeof pedidoStatusSchema>;

export const pedidoItemSchema = z.object({
  medicamentoId: z.string().uuid(),
  quantidade: z.number().int().min(1),
  precoUnitario: moneySchema.optional(),
  observacao: z.string().max(280).optional(),
});
export type PedidoItem = z.infer<typeof pedidoItemSchema>;

export const criarPedidoSchema = z.object({
  itens: z.array(pedidoItemSchema).min(1, 'Adicione pelo menos um item ao pedido'),
  enderecoEntregaId: z.string().uuid().optional(),
  receituarioUrl: z.string().url().optional(),
  observacao: z.string().max(500).optional(),
});
export type CriarPedidoInput = z.infer<typeof criarPedidoSchema>;

// Item retornado pela API — inclui medicamento aninhado
export const pedidoItemResponseSchema = z.object({
  id: z.string().uuid(),
  medicamentoId: z.string().uuid(),
  quantidade: z.number().int(),
  precoUnitario: z.union([z.string(), z.number()]),
  disponivel: z.boolean().optional(),
  observacao: z.string().nullable().optional(),
  medicamento: medicamentoSchema.partial().extend({ nome: z.string() }),
});
export type PedidoItemResponse = z.infer<typeof pedidoItemResponseSchema>;

export const pedidoSchema = z.object({
  id: z.string().uuid(),
  numero: z.string(),
  status: pedidoStatusSchema,
  total: z.union([z.string(), z.number()]),
  observacao: z.string().nullable().optional(),
  usuarioId: z.string().uuid().optional(),
  criadoEm: z.string(),
  atualizadoEm: z.string(),
  // Motor de cotação
  cotacaoEnviadaEm: z.string().nullable().optional(),
  cotacaoValidaAte: z.string().nullable().optional(),
  prazoEntregaDias: z.number().int().nullable().optional(),
  cotacaoObservacao: z.string().nullable().optional(),
  respondidaEm: z.string().nullable().optional(),
  itens: z.array(pedidoItemResponseSchema),
});
export type Pedido = z.infer<typeof pedidoSchema>;
