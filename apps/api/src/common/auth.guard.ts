import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export type AuthRequest = Request & { user: { id: string; role: string } };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token ausente');
    }
    const token = auth.slice(7);
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; role?: string }>(token);
      let role = payload.role;
      // Token antigo (emitido antes do role no JWT): resolve do banco. Transição
      // self-healing — some sozinho conforme os tokens expiram e são reemitidos.
      if (!role) {
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          select: { role: true },
        });
        role = user?.role ?? 'comprador';
      }
      req.user = { id: payload.sub, role };
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
