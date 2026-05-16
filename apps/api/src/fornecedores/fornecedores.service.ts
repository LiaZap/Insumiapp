import { Injectable } from '@nestjs/common';
import type { CriarFornecedorInput } from '@insumia/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FornecedoresService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.fornecedor.findMany({ orderBy: { nome: 'asc' } });
  }

  criar(dto: CriarFornecedorInput) {
    return this.prisma.fornecedor.create({
      data: {
        nome: dto.nome,
        cnpj: dto.cnpj || null,
        email: dto.email || null,
        telefone: dto.telefone || null,
        ativo: dto.ativo ?? true,
      },
    });
  }

  atualizar(id: string, dto: Partial<CriarFornecedorInput>) {
    return this.prisma.fornecedor.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.cnpj !== undefined && { cnpj: dto.cnpj || null }),
        ...(dto.email !== undefined && { email: dto.email || null }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone || null }),
        ...(dto.ativo !== undefined && { ativo: dto.ativo }),
      },
    });
  }
}
