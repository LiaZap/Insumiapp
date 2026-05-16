import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { LoginInput, SignupInput, User as SharedUser } from '@insumia/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** E-mail é case-insensitive — normaliza para evitar falha por maiúscula/espaço. */
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async signup(dto: SignupInput): Promise<{ user: SharedUser; accessToken: string }> {
    const email = this.normalizeEmail(dto.email);
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        nome: dto.nome,
        email,
        passwordHash,
        empresa: dto.empresa ?? null,
      },
    });
    return { user: this.toSharedUser(user), accessToken: this.signToken(user.id) };
  }

  async login(dto: LoginInput): Promise<{ user: SharedUser; accessToken: string }> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');
    return { user: this.toSharedUser(user), accessToken: this.signToken(user.id) };
  }

  private signToken(userId: string): string {
    return this.jwt.sign({ sub: userId });
  }

  private toSharedUser(u: {
    id: string;
    nome: string;
    email: string;
    empresa: string | null;
    role: string;
  }): SharedUser {
    return {
      id: u.id,
      nome: u.nome,
      email: u.email,
      empresa: u.empresa,
      role: u.role as SharedUser['role'],
    };
  }
}
