import { z } from 'zod';

export const configuracaoSchema = z.object({
  chave: z.string(),
  valor: z.string(),
  descricao: z.string().nullable().optional(),
});
export type Configuracao = z.infer<typeof configuracaoSchema>;

export const atualizarConfiguracoesSchema = z.object({
  itens: z.array(z.object({ chave: z.string().min(1), valor: z.string() })).min(1),
});
export type AtualizarConfiguracoesInput = z.infer<typeof atualizarConfiguracoesSchema>;

// Parâmetros de negócio + defaults — fonte única (API saneia, seed popula).
export const CONFIG_DEFAULTS: Record<string, { valor: string; descricao: string }> = {
  'estoque.limiar_baixo': {
    valor: '10',
    descricao: 'Quantidade abaixo da qual o estoque é marcado como "baixo".',
  },
  'cotacao.validade_horas': {
    valor: '48',
    descricao: 'Horas de validade da cotação enviada à clínica.',
  },
  'cotacao.margem_padrao': {
    valor: '30',
    descricao: 'Margem padrão (%) sugerida ao montar a cotação.',
  },
};
