import { z } from 'zod';
import { moneySchema } from './common';

// Admin monta a cotação — define preço e disponibilidade de cada item
export const cotacaoItemSchema = z.object({
  itemId: z.string().uuid(),
  precoUnitario: moneySchema,
  disponivel: z.boolean(),
});
export type CotacaoItemInput = z.infer<typeof cotacaoItemSchema>;

export const enviarCotacaoSchema = z.object({
  itens: z.array(cotacaoItemSchema).min(1),
  prazoEntregaDias: z.number().int().min(0).max(120),
  validadeHoras: z.number().int().min(1).max(720).default(48),
  observacao: z.string().max(500).optional(),
});
export type EnviarCotacaoInput = z.infer<typeof enviarCotacaoSchema>;
