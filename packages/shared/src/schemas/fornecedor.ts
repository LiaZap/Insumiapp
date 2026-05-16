import { z } from 'zod';

export const fornecedorSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  cnpj: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  ativo: z.boolean(),
  criadoEm: z.string(),
});
export type Fornecedor = z.infer<typeof fornecedorSchema>;

export const criarFornecedorSchema = z.object({
  nome: z.string().min(2),
  cnpj: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  telefone: z.string().optional(),
  ativo: z.boolean().optional(),
});
export type CriarFornecedorInput = z.infer<typeof criarFornecedorSchema>;

// Lance — oferta de um fornecedor num agrupamento
export const lanceSchema = z.object({
  id: z.string().uuid(),
  agrupamentoId: z.string().uuid(),
  fornecedorId: z.string().uuid().nullable().optional(),
  fornecedorNome: z.string(),
  precoUnitario: z.union([z.string(), z.number()]),
  prazoEntregaDias: z.number().int(),
  observacao: z.string().nullable().optional(),
  vencedor: z.boolean(),
  criadoEm: z.string(),
});
export type Lance = z.infer<typeof lanceSchema>;

// Lance enviado pelo link público (fornecedor sem login)
export const criarLancePublicoSchema = z.object({
  fornecedorNome: z.string().min(2, 'Informe o nome do fornecedor'),
  precoUnitario: z.number().positive('Preço deve ser maior que zero'),
  prazoEntregaDias: z.number().int().min(0).max(180),
  observacao: z.string().max(400).optional(),
});
export type CriarLancePublicoInput = z.infer<typeof criarLancePublicoSchema>;

// Lance registrado pelo admin (pode vincular um fornecedor cadastrado)
export const criarLanceAdminSchema = criarLancePublicoSchema.extend({
  fornecedorId: z.string().uuid().optional(),
});
export type CriarLanceAdminInput = z.infer<typeof criarLanceAdminSchema>;
