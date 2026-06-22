import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import type {
  AtualizarPerfilInput,
  LoginInput,
  SignupInput,
  User as SharedUser,
} from '@insumia/shared';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
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
    return { user: this.toSharedUser(user), accessToken: this.signToken(user.id, user.role) };
  }

  async login(dto: LoginInput): Promise<{ user: SharedUser; accessToken: string }> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');
    if (user.bloqueado) {
      throw new ForbiddenException('Conta bloqueada. Entre em contato com o suporte.');
    }
    return { user: this.toSharedUser(user), accessToken: this.signToken(user.id, user.role) };
  }

  /** Atualiza nome/empresa do próprio usuário (PATCH /auth/me). */
  async atualizarPerfil(usuarioId: string, dto: AtualizarPerfilInput): Promise<SharedUser> {
    const user = await this.prisma.user.update({
      where: { id: usuarioId },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.empresa !== undefined && { empresa: dto.empresa }),
      },
    });
    return this.toSharedUser(user);
  }

  private signToken(userId: string, role: string): string {
    return this.jwt.sign({ sub: userId, role });
  }

  /**
   * Gera token de reset e envia e-mail. Responde sem revelar se o e-mail
   * existe (boa prática de segurança).
   */
  async forgotPassword(emailInput: string): Promise<void> {
    const email = this.normalizeEmail(emailInput);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.bloqueado) return; // silencioso

    // Invalida tokens anteriores ainda válidos
    await this.prisma.passwordReset.updateMany({
      where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await this.prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    });

    const baseUrl = process.env.APP_BASE_URL ?? 'https://insumiaapp.bahflash.tech';
    const link = `${baseUrl}/recuperar?token=${token}`;
    await this.email.enviarReset({ para: user.email, nome: user.nome, link });
  }

  /** Valida o token e troca a senha. */
  async resetPassword(token: string, novaSenha: string): Promise<void> {
    const record = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!record || record.used || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Link inválido ou expirado. Solicite um novo.');
    }
    const passwordHash = await bcrypt.hash(novaSenha, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordReset.update({
        where: { id: record.id },
        data: { used: true },
      }),
    ]);
  }

  /**
   * Exclusão definitiva: remove a conta do usuário e todos os dados vinculados.
   * Exigência da App Store (Guideline 5.1.1(v)) — o usuário precisa poder
   * iniciar a exclusão pelo próprio app, sem depender de contato externo.
   */
  async deleteAccount(usuarioId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.conta.deleteMany({ where: { pedido: { usuarioId } } });
      await tx.pedidoItem.deleteMany({ where: { pedido: { usuarioId } } });
      await tx.pedido.deleteMany({ where: { usuarioId } });
      await tx.movimentacao.deleteMany({ where: { usuarioId } });
      await tx.estoqueItem.deleteMany({ where: { usuarioId } });
      await tx.user.delete({ where: { id: usuarioId } });
    });
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
