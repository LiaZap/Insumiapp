import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  empresa: z.string().min(2).optional(),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthTokens = z.infer<typeof authTokensSchema>;

export const userSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  email: z.string().email(),
  empresa: z.string().nullable(),
  role: z.enum(['admin', 'comprador', 'financeiro']).default('comprador'),
});
export type User = z.infer<typeof userSchema>;

// Edição de perfil do próprio usuário (PATCH /users/me). empresa = null limpa o campo.
export const atualizarPerfilSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto').optional(),
  empresa: z.string().min(2).nullable().optional(),
});
export type AtualizarPerfilInput = z.infer<typeof atualizarPerfilSchema>;

export const userRoleSchema = z.enum(['admin', 'comprador', 'financeiro']);
export type UserRole = z.infer<typeof userRoleSchema>;

// Admin cria um membro de equipe ou cliente no back-office.
export const criarUsuarioAdminSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  empresa: z.string().min(2).optional(),
  role: userRoleSchema,
});
export type CriarUsuarioAdminInput = z.infer<typeof criarUsuarioAdminSchema>;

// Promove/rebaixa o papel de um usuário (admin-only, auditável).
export const alterarRoleSchema = z.object({ role: userRoleSchema });
export type AlterarRoleInput = z.infer<typeof alterarRoleSchema>;
