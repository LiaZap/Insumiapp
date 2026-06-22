import { Injectable, NotFoundException } from '@nestjs/common';
import type { CriarContaInput, DashboardFinanceiro } from '@insumia/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FinanceiroService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listar(filtro?: { tipo?: 'pagar' | 'receber'; status?: string }) {
    return this.prisma.conta.findMany({
      where: {
        ...(filtro?.tipo && { tipo: filtro.tipo }),
        ...(filtro?.status && { status: filtro.status as never }),
      },
      orderBy: { vencimento: 'asc' },
      include: {
        pedido: { select: { id: true, numero: true } },
      },
    });
  }

  async criar(dto: CriarContaInput) {
    return this.prisma.conta.create({
      data: {
        tipo: dto.tipo,
        descricao: dto.descricao,
        valor: dto.valor,
        vencimento: new Date(dto.vencimento),
        pedidoId: dto.pedidoId,
      },
      include: {
        pedido: { select: { id: true, numero: true } },
      },
    });
  }

  async marcarPaga(id: string, atorId?: string) {
    const conta = await this.prisma.conta.findUnique({ where: { id } });
    if (!conta) throw new NotFoundException('Conta não encontrada');
    const atualizada = await this.prisma.conta.update({
      where: { id },
      data: { status: 'paga', pagoEm: new Date() },
      include: { pedido: { select: { id: true, numero: true } } },
    });
    await this.audit.registrar({
      atorId,
      acao: 'conta.paga',
      entidade: 'Conta',
      entidadeId: id,
      antes: { status: conta.status },
      depois: { status: 'paga', valor: Number(conta.valor) },
    });
    return atualizada;
  }

  async cancelar(id: string, atorId?: string) {
    const atualizada = await this.prisma.conta.update({
      where: { id },
      data: { status: 'cancelada' },
    });
    await this.audit.registrar({
      atorId,
      acao: 'conta.cancelada',
      entidade: 'Conta',
      entidadeId: id,
    });
    return atualizada;
  }

  async dashboard(): Promise<DashboardFinanceiro> {
    // Marca contas vencidas (que passaram do vencimento e ainda estão abertas)
    const now = new Date();
    await this.prisma.conta.updateMany({
      where: { status: 'aberta', vencimento: { lt: now } },
      data: { status: 'vencida' },
    });

    const [aPagar, aReceber, vencidas] = await Promise.all([
      this.prisma.conta.aggregate({
        where: { tipo: 'pagar', status: { in: ['aberta', 'vencida'] } },
        _sum: { valor: true },
      }),
      this.prisma.conta.aggregate({
        where: { tipo: 'receber', status: { in: ['aberta', 'vencida'] } },
        _sum: { valor: true },
      }),
      this.prisma.conta.count({ where: { status: 'vencida' } }),
    ]);

    // Fluxo dos últimos 6 meses (entradas = receber paga, saídas = pagar paga)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const contasPagas = await this.prisma.conta.findMany({
      where: { status: 'paga', pagoEm: { gte: sixMonthsAgo } },
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
