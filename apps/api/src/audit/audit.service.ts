import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra uma ação sensível.
   * - Sem `tx` (padrão): fire-and-forget pós-operação — NUNCA lança, para não
   *   derrubar a operação por falha de log.
   * - Com `tx`: grava DENTRO da transação do chamador (atômico). Aqui a falha
   *   PROPAGA de propósito, revertendo a operação — use em ações irreversíveis
   *   (ex.: exclusão definitiva) onde a trilha não pode faltar.
   */
  async registrar(
    params: {
      atorId?: string | null;
      acao: string;
      entidade: string;
      entidadeId: string;
      antes?: unknown;
      depois?: unknown;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const data = {
      atorId: params.atorId ?? null,
      acao: params.acao,
      entidade: params.entidade,
      entidadeId: params.entidadeId,
      dadosAntes: (params.antes ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      dadosDepois: (params.depois ?? Prisma.JsonNull) as Prisma.InputJsonValue,
    };
    if (tx) {
      await tx.auditLog.create({ data });
      return;
    }
    try {
      await this.prisma.auditLog.create({ data });
    } catch (err) {
      this.logger.warn(`Falha ao registrar auditoria "${params.acao}"`, err as Error);
    }
  }
}
