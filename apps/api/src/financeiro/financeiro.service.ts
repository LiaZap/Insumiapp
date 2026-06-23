import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { CriarContaInput, DashboardFinanceiro } from '@insumia/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FinanceiroService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Operador (admin/financeiro) vê todas as contas; comprador só as próprias. */
  private isOperador(role: string): boolean {
    return role === 'admin' || role === 'financeiro';
  }

  /** Anti-IDOR: comprador só acessa conta própria (404 não revela existência). */
  private assertOwner(conta: { usuarioId: string | null }, requester: { id: string; role: string }) {
    if (!this.isOperador(requester.role) && conta.usuarioId !== requester.id) {
      throw new NotFoundException('Conta não encontrada');
    }
  }

  async listar(
    filtro: { tipo?: 'pagar' | 'receber'; status?: string },
    requester: { id: string; role: string },
  ) {
    return this.prisma.conta.findMany({
      where: {
        ...(filtro?.tipo && { tipo: filtro.tipo }),
        ...(filtro?.status && { status: filtro.status as never }),
        ...(!this.isOperador(requester.role) && { usuarioId: requester.id }),
      },
      orderBy: { vencimento: 'asc' },
      include: {
        pedido: { select: { id: true, numero: true } },
      },
    });
  }

  async criar(dto: CriarContaInput, requester: { id: string; role: string }) {
    // Conta vinculada a pedido: comprador só pode referenciar o PRÓPRIO pedido
    // (anti-IDOR — senão leria o número de pedido de outra clínica via include).
    if (dto.pedidoId && !this.isOperador(requester.role)) {
      const pedido = await this.prisma.pedido.findUnique({
        where: { id: dto.pedidoId },
        select: { usuarioId: true },
      });
      if (!pedido || pedido.usuarioId !== requester.id) {
        throw new BadRequestException('Pedido inválido');
      }
    }
    return this.prisma.conta.create({
      data: {
        tipo: dto.tipo,
        descricao: dto.descricao,
        valor: dto.valor,
        vencimento: new Date(dto.vencimento),
        pedidoId: dto.pedidoId,
        usuarioId: requester.id,
      },
      include: {
        pedido: { select: { id: true, numero: true } },
      },
    });
  }

  async marcarPaga(id: string, requester: { id: string; role: string }) {
    const conta = await this.prisma.conta.findUnique({ where: { id } });
    if (!conta) throw new NotFoundException('Conta não encontrada');
    this.assertOwner(conta, requester);
    const atualizada = await this.prisma.conta.update({
      where: { id },
      data: { status: 'paga', pagoEm: new Date() },
      include: { pedido: { select: { id: true, numero: true } } },
    });
    await this.audit.registrar({
      atorId: requester.id,
      acao: 'conta.paga',
      entidade: 'Conta',
      entidadeId: id,
      antes: { status: conta.status },
      depois: { status: 'paga', valor: Number(conta.valor) },
    });
    return atualizada;
  }

  async cancelar(id: string, requester: { id: string; role: string }) {
    const conta = await this.prisma.conta.findUnique({ where: { id } });
    if (!conta) throw new NotFoundException('Conta não encontrada');
    this.assertOwner(conta, requester);
    const atualizada = await this.prisma.conta.update({
      where: { id },
      data: { status: 'cancelada' },
    });
    await this.audit.registrar({
      atorId: requester.id,
      acao: 'conta.cancelada',
      entidade: 'Conta',
      entidadeId: id,
    });
    return atualizada;
  }

  async dashboard(requester: { id: string; role: string }): Promise<DashboardFinanceiro> {
    // Comprador vê só o próprio financeiro; admin/financeiro veem a operação.
    const escopo = this.isOperador(requester.role) ? {} : { usuarioId: requester.id };

    // Marca contas vencidas (manutenção — passou do vencimento e ainda aberta).
    // Escopado: comprador não altera contas de outras clínicas.
    const now = new Date();
    await this.prisma.conta.updateMany({
      where: { status: 'aberta', vencimento: { lt: now }, ...escopo },
      data: { status: 'vencida' },
    });

    const [aPagar, aReceber, vencidas] = await Promise.all([
      this.prisma.conta.aggregate({
        where: { tipo: 'pagar', status: { in: ['aberta', 'vencida'] }, ...escopo },
        _sum: { valor: true },
      }),
      this.prisma.conta.aggregate({
        where: { tipo: 'receber', status: { in: ['aberta', 'vencida'] }, ...escopo },
        _sum: { valor: true },
      }),
      this.prisma.conta.count({ where: { status: 'vencida', ...escopo } }),
    ]);

    // Fluxo dos últimos 6 meses (entradas = receber paga, saídas = pagar paga)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const contasPagas = await this.prisma.conta.findMany({
      where: { status: 'paga', pagoEm: { gte: sixMonthsAgo }, ...escopo },
      select: { tipo: true, valor: true, pagoEm: true },
    });

    const fluxoMap = new Map<string, { entradas: number; saidas: number }>();
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo);
      d.setMonth(d.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      fluxoMap.set(key, { entradas: 0, saidas: 0 });
    }
    for (const c of contasPagas) {
      if (!c.pagoEm) continue;
      const key = `${c.pagoEm.getFullYear()}-${String(c.pagoEm.getMonth() + 1).padStart(2, '0')}`;
      const slot = fluxoMap.get(key);
      if (!slot) continue;
      if (c.tipo === 'receber') slot.entradas += Number(c.valor);
      else slot.saidas += Number(c.valor);
    }

    return {
      totalAPagar: Number(aPagar._sum.valor ?? 0),
      totalAReceber: Number(aReceber._sum.valor ?? 0),
      vencidasCount: vencidas,
      fluxoMensal: Array.from(fluxoMap.entries()).map(([mes, v]) => ({
        mes,
        entradas: v.entradas,
        saidas: v.saidas,
      })),
    };
  }
}
