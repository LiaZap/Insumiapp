import { z } from 'zod';

export const idSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});
export type Pagination = z.infer<typeof paginationSchema>;

export const paginatedResponse = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    data: z.array(item),
    page: z.number(),
    perPage: z.number(),
    total: z.number(),
  });

export const moneySchema = z.number().nonnegative().multipleOf(0.01);

export const dateStringSchema = z.string().datetime();
