import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista de clientes para o painel admin, com estatísticas básicas. */
  async listAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        role: true,
        bloqueado: true,
        criadoEm: true,
      },
    });

    // Agrega contagem e valor total de pedidos por usuário em paralelo.
    const stats = await Promise.all(
      users.map(async (u) => {
        const agg = await this.prisma.pedido.aggregate({
          where: { usuarioId: u.id },
          _count: { _all: true },
          _sum: { total: true },
        });
        return {
          ...u,
          pedidosCount: agg._count._all,
          pedidosValor: Number(agg._sum.total ?? 0),
        };
      }),
    );

    return stats;
  }

  /** Toggle do bloqueio. Admin não pode se bloquear. */
  async toggleBloqueio(targetId: string, requesterId: string) {
    if (targetId === requesterId) {
      throw new BadRequestException('Você não pode bloquear sua própria conta.');
    }
    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException('Usuário não encontrado');
    if (target.role === 'admin') {
      throw new ForbiddenException('Contas admin não podem ser bloqueadas pelo painel.');
    }
    return this.prisma.user.update({
      where: { id: targetId },
      data: { bloqueado: !target.bloqueado },
      select: { id: true, bloqueado: true },
    });
  }

  /** Exclusão definitiva. Admin não pode se excluir. */
  async delete(targetId: string, requesterId: string) {
    if (targetId === requesterId) {
      throw new BadRequestException('Use o app mobile para excluir sua própria conta.');
    }
    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException('Usuário não encontrado');
    if (target.role === 'admin') {
      throw new ForbiddenException('Contas admin não podem ser excluídas pelo painel.');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.conta.deleteMany({ where: { pedido: { usuarioId: targetId } } });
      await tx.pedidoItem.deleteMany({ where: { pedido: { usuarioId: targetId } } });
      await tx.pedido.deleteMany({ where: { usuarioId: targetId } });
      await tx.movimentacao.deleteMany({ where: { usuarioId: targetId } });
      await tx.estoqueItem.deleteMany({ where: { usuarioId: targetId } });
      await tx.user.delete({ where: { id: targetId } });
    });
  }
}
