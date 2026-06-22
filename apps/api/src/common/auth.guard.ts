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

    let sub: string;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(auth.slice(7));
      sub = payload.sub;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }

    // Autoritativo pelo banco: garante revogação imediata (usuário excluído →
    // 401; bloqueado → 403) e role sempre fresca. Sem isto, um token de 7 dias
    // mantém acesso mesmo após bloqueio/rebaixamento/exclusão.
    const user = await this.prisma.user.findUnique({
      where: { id: sub },
      select: { id: true, role: true, bloqueado: true },
    });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    if (user.bloqueado) throw new ForbiddenException('Conta bloqueada');

    req.user = { id: user.id, role: user.role };
    return true;
  }
}
