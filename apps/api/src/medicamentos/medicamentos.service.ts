import { Injectable } from '@nestjs/common';
import type { BuscaMedicamentoInput } from '@insumia/shared';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MedicamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async buscar(input: BuscaMedicamentoInput) {
    const { q, categoria, page, perPage } = input;
    const where: Prisma.MedicamentoWhereInput = {
      ...(q && {
        OR: [
          { nome: { contains: q, mode: 'insensitive' } },
          { fabricante: { contains: q, mode: 'insensitive' } },
          { principioAtivo: { contains: q, mode: 'insensitive' } },
        ],
      }),
      ...(categoria && { categoria }),
    };
    const [total, data] = await Promise.all([
      this.prisma.medicamento.count({ where }),
      this.prisma.medicamento.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { nome: 'asc' },
      }),
    ]);
    return { data, page, perPage, total };
  }

  async criar(dto: Prisma.MedicamentoCreateInput) {
    return this.prisma.medicamento.create({ data: dto });
  }

  async atualizar(id: string, dto: Prisma.MedicamentoUpdateInput) {
    return this.prisma.medicamento.update({ where: { id }, data: dto });
  }
}
