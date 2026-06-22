import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export type AdminRequest = Request & { user: { id: string; role: string } };

/**
 * Garante que a requisição vem de um usuário autenticado COM role=admin.
 * Usado nas rotas do painel administrativo do back-office.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AdminRequest>();
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token ausente');
    }
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(auth.slice(7));
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true, bloqueado: true },
      });
      if (!user) throw new UnauthorizedException('Usuário não encontrado');
      if (user.bloqueado) throw new ForbiddenException('Conta bloqueada');
      if (user.role !== 'admin') {
        throw new ForbiddenException('Acesso restrito a administradores');
      }
      req.user = { id: user.id, role: user.role };
      return true;
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      throw new UnauthorizedException('Token inválido');
    }
  }
}
