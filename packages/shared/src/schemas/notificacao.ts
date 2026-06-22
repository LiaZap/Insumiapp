import { z } from 'zod';

// Notificação persistida (model Notificacao no Prisma). Todo push enviado
// passa a gerar um registro com estado de leitura — antes era mock no app.
export const notificacaoTipoSchema = z.enum(['pedido', 'alerta', 'sistema']);
export type NotificacaoTipo = z.infer<typeof notificacaoTipoSchema>;

export const notificacaoSchema = z.object({
  id: z.string().uuid(),
  tipo: notificacaoTipoSchema,
  titulo: z.string(),
  corpo: z.string(),
  pedidoId: z.string().uuid().nullable().optional(),
  lidaEm: z.string().nullable().optional(),
  criadoEm: z.string(),
});
export type Notificacao = z.infer<typeof notificacaoSchema>;
