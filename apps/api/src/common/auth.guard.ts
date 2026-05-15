import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export type AuthRequest = Request & { user: { id: string } };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token ausente');
    }
    const token = auth.slice(7);
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      req.user = { id: payload.sub };
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
