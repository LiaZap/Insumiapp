import { z } from 'zod';

// Categorias do catálogo de insumos da clínica.
// Foco em produtos cosméticos, descartáveis e materiais de uso geral.
export const medicamentoCategoriaSchema = z.enum([
  'estetica',
  'higiene',
  'descartaveis',
  'material',
  'antissepticos',
  'solucoes',
  'insumos',
]);
export type MedicamentoCategoria = z.infer<typeof medicamentoCategoriaSchema>;

export const CATEGORIA_LABEL: Record<MedicamentoCategoria, string> = {
  estetica: 'Estética',
  higiene: 'Higiene',
  descartaveis: 'Descartáveis',
  material: 'Material',
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
