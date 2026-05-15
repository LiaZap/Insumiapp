import { z } from 'zod';

export const contaStatusSchema = z.enum(['aberta', 'paga', 'vencida', 'cancelada']);
export type ContaStatus = z.infer<typeof contaStatusSchema>;

export const contaTipoSchema = z.enum(['pagar', 'receber']);
export type ContaTipo = z.infer<typeof contaTipoSchema>;

export const STATUS_LABEL: Record<ContaStatus, string> = {
  aberta: 'Aberta',
  paga: 'Paga',
  vencida: 'Vencida',
  cancelada: 'Cancelada',
};

export const TIPO_LABEL: Record<ContaTipo, string> = {
  pagar: 'A Pagar',
  receber: 'A Receber',
};

// Decimal vem como string do Prisma — aceita string|number
const decimalSchema = z.union([z.string(), z.number()]);

export const contaSchema = z.object({
  id: z.string().uuid(),
  tipo: contaTipoSchema,
  descricao: z.string(),
  valor: decimalSchema,
  vencimento: z.string(),
  status: contaStatusSchema,
  pedidoId: z.string().uuid().nullable(),
  pagoEm: z.string().nullable(),
  criadoEm: z.string(),
  pedido: z
    .object({ id: z.string().uuid(), numero: z.string() })
    .nullable()
    .optional(),
});
export type Conta = z.infer<typeof contaSchema>;

export const criarContaSchema = z.object({
  tipo: contaTipoSchema,
  descricao: z.string().min(2),
  valor: z.number().nonnegative().multipleOf(0.01),
  vencimento: z.string().datetime(),
  pedidoId: z.string().uuid().optional(),
});
export type CriarContaInput = z.infer<typeof criarContaSchema>;

export const dashboardFinanceiroSchema = z.object({
  totalAPagar: decimalSchema,
  totalAReceber: decimalSchema,
  vencidasCount: z.number().int().min(0),
  fluxoMensal: z.array(
    z.object({
      mes: z.string(),
      entradas: decimalSchema,
      saidas: decimalSchema,
    }),
  ),
});
export type DashboardFinanceiro = z.infer<typeof dashboardFinanceiroSchema>;
