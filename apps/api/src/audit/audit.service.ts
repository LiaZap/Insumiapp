import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  constructor(private readonly prisma: PrismaService) {}

  /** Registra uma ação sensível. NUNCA lança — auditoria não derruba a operação. */
  async registrar(params: {
    atorId?: string | null;
    acao: string;
    entidade: string;
    entidadeId: string;
    antes?: unknown;
    depois?: unknown;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          atorId: params.atorId ?? null,
          acao: params.acao,
          entidade: params.entidade,
          entidadeId: params.entidadeId,
          dadosAntes: (params.antes ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          dadosDepois: (params.depois ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      this.logger.warn(`Falha ao registrar auditoria "${params.acao}"`, err as Error);
    }
  }
}
