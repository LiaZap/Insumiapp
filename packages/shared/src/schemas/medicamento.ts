import { z } from 'zod';

// Categorias extraídas do Figma (Busca de Medicamento 118:186)
export const medicamentoCategoriaSchema = z.enum([
  'preenchedores',
  'bioestimuladores',
  'neuromoduladores',
  'anestesicos',
  'corticoides',
  'enzimas',
  'antissepticos',
  'solucoes',
  'insumos',
]);
export type MedicamentoCategoria = z.infer<typeof medicamentoCategoriaSchema>;

export const CATEGORIA_LABEL: Record<MedicamentoCategoria, string> = {
  preenchedores: 'Preenchedores',
  bioestimuladores: 'Bioestimuladores',
  neuromoduladores: 'Neuromoduladores',
  anestesicos: 'Anestésicos',
  corticoides: 'Corticoides',
  enzimas: 'Enzimas',
  antissepticos: 'Antissépticos',
  solucoes: 'Soluções',
  insumos: 'Insumos',
};

export const medicamentoSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(2),
  principioAtivo: z.string().nullable(),
  fabricante: z.string().nullable(),
  apresentacao: z.string().nullable(),
  dosagem: z.string().nullable(),
  categoria: medicamentoCategoriaSchema,
  precoUnitario: z.union([z.string(), z.number()]),
  custo: z.union([z.string(), z.number()]).nullable().optional(),
  ean: z.string().nullable(),
  receituario: z.boolean().default(false),
  imagemUrl: z.string().url().nullable(),
});
export type Medicamento = z.infer<typeof medicamentoSchema>;

export const buscaMedicamentoSchema = z.object({
  q: z.string().optional(),
  categoria: medicamentoCategoriaSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(50),
});
export type BuscaMedicamentoInput = z.infer<typeof buscaMedicamentoSchema>;
