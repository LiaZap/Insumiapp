import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { CriarUsuarioAdminInput, UserRole } from '@insumia/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const USER_SELECT = {
  id: true,
  nome: true,
  email: true,
  empresa: true,
  role: true,
  bloqueado: true,
  criadoEm: true,
} as const;

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

  /** Admin cria um usuário (membro de equipe ou cliente). */
  async criar(dto: CriarUsuarioAdminInput, requesterId: string) {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('E-mail já cadastrado');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        nome: dto.nome,
        email,
        passwordHash,
        empresa: dto.empresa ?? null,
        role: dto.role,
      },
      select: USER_SELECT,
    });
    await this.audit.registrar({
      atorId: requesterId,
      acao: 'user.criar',
      entidade: 'User',
      entidadeId: user.id,
      depois: { email: user.email, role: user.role },
    });
    return { ...user, pedidosCount: 0, pedidosValor: 0 };
  }

  /** Promove/rebaixa o papel — admin-only e auditável (RBAC.md). */
  async alterarRole(targetId: string, novoRole: UserRole, requesterId: string) {
    if (targetId === requesterId) {
      throw new BadRequestException('Você não pode alterar o próprio papel.');
    }
    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException('Usuário não encontrado');
    if (target.role === novoRole) {
      return { id: target.id, role: target.role };
    }
    const atualizado = await this.prisma.user.update({
      where: { id: targetId },
      data: { role: novoRole },
      select: { id: true, role: true },
    });
    await this.audit.registrar({
      atorId: requesterId,
      acao: 'user.role',
      entidade: 'User',
      entidadeId: targetId,
      antes: { role: target.role },
      depois: { role: novoRole },
    });
    return atualizado;
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
