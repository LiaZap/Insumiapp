import { z } from 'zod';

// Endereço de entrega/cobrança de uma clínica. Persistido em tabela própria
// (model Endereco no Prisma) — antes vivia só no AsyncStorage do app.

// Leitura: tolerante (não quebra parsing de dados antigos).
export const enderecoSchema = z.object({
  id: z.string().uuid(),
  apelido: z.string(),
  logradouro: z.string(),
  numero: z.string().nullable().optional(),
  complemento: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  cidade: z.string(),
  uf: z.string(),
  cep: z.string(),
  principal: z.boolean(),
  criadoEm: z.string(),
});
export type Endereco = z.infer<typeof enderecoSchema>;

// Escrita: estrita (validação na borda).
export const criarEnderecoSchema = z.object({
  apelido: z.string().min(1, 'Informe um apelido').max(60),
  logradouro: z.string().min(1, 'Informe o logradouro').max(160),
  numero: z.string().max(20).optional(),
  complemento: z.string().max(120).optional(),
  bairro: z.string().max(120).optional(),
  cidade: z.string().min(1, 'Informe a cidade').max(120),
  uf: z.string().length(2, 'UF deve ter 2 letras'),
  cep: z.string().min(8, 'CEP inválido').max(9),
  principal: z.boolean().optional(),
});
export type CriarEnderecoInput = z.infer<typeof criarEnderecoSchema>;

export const atualizarEnderecoSchema = criarEnderecoSchema.partial();
export type AtualizarEnderecoInput = z.infer<typeof atualizarEnderecoSchema>;
