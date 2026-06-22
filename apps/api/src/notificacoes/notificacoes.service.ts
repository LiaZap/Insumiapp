import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificacoesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Notificações do usuário — mais recentes primeiro. */
  listar(usuarioId: string) {
    return this.prisma.notificacao.findMany({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' },
      take: 100,
    });
  }

  /** Quantidade de não lidas — alimenta o badge do sino. */
  async naoLidas(usuarioId: string) {
    const total = await this.prisma.notificacao.count({
      where: { usuarioId, lidaEm: null },
    });
    return { total };
  }

  async marcarLida(usuarioId: string, id: string) {
    const n = await this.prisma.notificacao.findUnique({ where: { id } });
    if (!n || n.usuarioId !== usuarioId) {
      throw new NotFoundException('Notificação não encontrada');
    }
    return this.prisma.notificacao.update({
      where: { id },
      data: { lidaEm: new Date() },
    });
  }

  async marcarTodasLidas(usuarioId: string) {
    await this.prisma.notificacao.updateMany({
      where: { usuarioId, lidaEm: null },
      data: { lidaEm: new Date() },
    });
  }
}
