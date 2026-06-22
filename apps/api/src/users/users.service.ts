import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

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

    // Agrega contagem e valor de pedidos por usuário em UMA query (evita N+1).
    const grupos = await this.prisma.pedido.groupBy({
      by: ['usuarioId'],
      _count: { _all: true },
      _sum: { total: true },
    });
    const porUsuario = new Map(grupos.map((g) => [g.usuarioId, g]));

    return users.map((u) => {
      const g = porUsuario.get(u.id);
      return {
        ...u,
        pedidosCount: g?._count._all ?? 0,
        pedidosValor: Number(g?._sum.total ?? 0),
      };
    });
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
    const atualizado = await this.prisma.user.update({
      where: { id: targetId },
      data: { bloqueado: !target.bloqueado },
      select: { id: true, bloqueado: true },
    });
    await this.audit.registrar({
      atorId: requesterId,
      acao: 'user.bloqueio',
      entidade: 'User',
      entidadeId: targetId,
      antes: { bloqueado: target.bloqueado },
      depois: { bloqueado: atualizado.bloqueado },
    });
    return atualizado;
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
      // Auditoria atômica: exclusão irreversível não pode ficar sem trilha.
      await this.audit.registrar(
        {
          atorId: requesterId,
          acao: 'user.delete',
          entidade: 'User',
          entidadeId: targetId,
          antes: { nome: target.nome, email: target.email, role: target.role },
        },
        tx,
      );
    });
  }
}
