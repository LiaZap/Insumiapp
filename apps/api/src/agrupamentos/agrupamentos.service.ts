import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type Tx = Prisma.TransactionClient;

@Injectable()
export class AgrupamentosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Garante um agrupamento ABERTO para o medicamento e devolve seu id.
   * Reutiliza o aberto existente ou cria um novo. Pode rodar dentro de transação.
   */
  static async agrupamentoAbertoId(tx: Tx, medicamentoId: string): Promise<string> {
    const aberto = await tx.agrupamento.findFirst({
      where: { medicamentoId, status: 'aberto' },
    });
    if (aberto) return aberto.id;

    const numero = `AGR-${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 100,
    )}`;
    const novo = await tx.agrupamento.create({
      data: { numero, medicamentoId, status: 'aberto' },
    });
    return novo.id;
  }

  async listar(status?: string) {
    const agrupamentos = await this.prisma.agrupamento.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { criadoEm: 'desc' },
      include: {
        medicamento: true,
        itens: { select: { quantidade: true, pedidoId: true } },
      },
    });

    return agrupamentos.map((a) => ({
      id: a.id,
      numero: a.numero,
      status: a.status,
      criadoEm: a.criadoEm.toISOString(),
      fechadoEm: a.fechadoEm?.toISOString() ?? null,
      medicamento: {
        id: a.medicamento.id,
        nome: a.medicamento.nome,
        fabricante: a.medicamento.fabricante,
        apresentacao: a.medicamento.apresentacao,
        dosagem: a.medicamento.dosagem,
        categoria: a.medicamento.categoria as never,
        precoUnitario: Number(a.medicamento.precoUnitario),
      },
      totalPedidos: new Set(a.itens.map((i) => i.pedidoId)).size,
      totalVolume: a.itens.reduce((s, i) => s + i.quantidade, 0),
    }));
  }

  async detalhe(id: string) {
    const a = await this.prisma.agrupamento.findUnique({
      where: { id },
      include: {
        medicamento: true,
        itens: {
          include: { pedido: { include: { usuario: true } } },
          orderBy: { id: 'asc' },
        },
        lances: { orderBy: { precoUnitario: 'asc' } },
      },
    });
    if (!a) throw new NotFoundException('Agrupamento não encontrado');

    return {
      id: a.id,
      numero: a.numero,
      status: a.status,
      publicToken: a.publicToken,
      observacao: a.observacao,
      criadoEm: a.criadoEm.toISOString(),
      fechadoEm: a.fechadoEm?.toISOString() ?? null,
      medicamento: {
        id: a.medicamento.id,
        nome: a.medicamento.nome,
        fabricante: a.medicamento.fabricante,
        apresentacao: a.medicamento.apresentacao,
        dosagem: a.medicamento.dosagem,
        categoria: a.medicamento.categoria as never,
        precoUnitario: Number(a.medicamento.precoUnitario),
      },
      totalPedidos: new Set(a.itens.map((i) => i.pedidoId)).size,
      totalVolume: a.itens.reduce((s, i) => s + i.quantidade, 0),
      linhas: a.itens.map((i) => ({
        itemId: i.id,
        pedidoId: i.pedidoId,
        pedidoNumero: i.pedido.numero,
        clinica: i.pedido.usuario.empresa ?? i.pedido.usuario.nome,
        quantidade: i.quantidade,
        criadoEm: i.pedido.criadoEm.toISOString(),
      })),
      lances: a.lances.map((l) => ({
        id: l.id,
        agrupamentoId: l.agrupamentoId,
        fornecedorId: l.fornecedorId,
        fornecedorNome: l.fornecedorNome,
        precoUnitario: Number(l.precoUnitario),
        prazoEntregaDias: l.prazoEntregaDias,
        observacao: l.observacao,
        vencedor: l.vencedor,
        criadoEm: l.criadoEm.toISOString(),
      })),
      rastreabilidade: a.finalizadoEm
        ? {
            lote: a.lote,
            validade: a.validade?.toISOString() ?? null,
            fabricante: a.fabricante,
            notaFiscal: a.notaFiscal,
            fornecedor: a.lances.find((l) => l.vencedor)?.fornecedorNome ?? null,
            finalizadoEm: a.finalizadoEm.toISOString(),
          }
        : null,
    };
  }

  /** Admin finaliza a compra e registra a rastreabilidade (lote, fabricante, NF). */
  async finalizar(
    id: string,
    dto: { lote: string; validade?: string; fabricante?: string; notaFiscal?: string },
  ) {
    const a = await this.prisma.agrupamento.findUnique({ where: { id } });
    if (!a) throw new NotFoundException('Agrupamento não encontrado');
    if (a.status !== 'cotado') {
      throw new BadRequestException('Só agrupamentos cotados podem ser finalizados');
    }
    await this.prisma.agrupamento.update({
      where: { id },
      data: {
        status: 'finalizado',
        lote: dto.lote,
        validade: dto.validade ? new Date(dto.validade) : null,
        fabricante: dto.fabricante,
        notaFiscal: dto.notaFiscal,
        finalizadoEm: new Date(),
      },
    });
    return this.detalhe(id);
  }

  /** Info pública de um agrupamento — usada na página de lance do fornecedor. */
  async publico(token: string) {
    const a = await this.prisma.agrupamento.findUnique({
      where: { publicToken: token },
      include: { medicamento: true, itens: { select: { quantidade: true, pedidoId: true } } },
    });
    if (!a) throw new NotFoundException('Cotação não encontrada');
    return {
      id: a.id,
      numero: a.numero,
      status: a.status,
      aceitandoLances: a.status === 'em_cotacao',
      medicamento: {
        nome: a.medicamento.nome,
        fabricante: a.medicamento.fabricante,
        apresentacao: a.medicamento.apresentacao,
        dosagem: a.medicamento.dosagem,
      },
      totalPedidos: new Set(a.itens.map((i) => i.pedidoId)).size,
      totalVolume: a.itens.reduce((s, i) => s + i.quantidade, 0),
    };
  }

  /** Fornecedor envia um lance pelo link público. */
  async criarLancePublico(
    token: string,
    dto: { fornecedorNome: string; precoUnitario: number; prazoEntregaDias: number; observacao?: string },
  ) {
    const a = await this.prisma.agrupamento.findUnique({ where: { publicToken: token } });
    if (!a) throw new NotFoundException('Cotação não encontrada');
    if (a.status !== 'em_cotacao') {
      throw new BadRequestException('Esta cotação não está aceitando lances');
    }
    return this.prisma.lance.create({
      data: {
        agrupamentoId: a.id,
        fornecedorNome: dto.fornecedorNome,
        precoUnitario: dto.precoUnitario,
        prazoEntregaDias: dto.prazoEntregaDias,
        observacao: dto.observacao,
      },
    });
  }

  /** Admin registra um lance manualmente. */
  async criarLanceAdmin(
    id: string,
    dto: {
      fornecedorNome: string;
      fornecedorId?: string;
      precoUnitario: number;
      prazoEntregaDias: number;
      observacao?: string;
    },
  ) {
    const a = await this.prisma.agrupamento.findUnique({ where: { id } });
    if (!a) throw new NotFoundException('Agrupamento não encontrado');
    if (a.status !== 'em_cotacao') {
      throw new BadRequestException('Agrupamento não está em cotação');
    }
    await this.prisma.lance.create({
      data: {
        agrupamentoId: id,
        fornecedorId: dto.fornecedorId,
        fornecedorNome: dto.fornecedorNome,
        precoUnitario: dto.precoUnitario,
        prazoEntregaDias: dto.prazoEntregaDias,
        observacao: dto.observacao,
      },
    });
    return this.detalhe(id);
  }

  /**
   * Admin escolhe o lance vencedor: propaga o preço para os itens dos pedidos,
   * recalcula totais e move os pedidos para cotação quando completos.
   */
  async escolherVencedor(id: string, lanceId: string) {
    const a = await this.prisma.agrupamento.findUnique({
      where: { id },
      include: { lances: true, itens: true },
    });
    if (!a) throw new NotFoundException('Agrupamento não encontrado');
    const lance = a.lances.find((l) => l.id === lanceId);
    if (!lance) throw new NotFoundException('Lance não encontrado');
    if (a.status !== 'em_cotacao') {
      throw new BadRequestException('Agrupamento não está em cotação');
    }

    await this.prisma.$transaction(async (tx) => {
      // Marca vencedor
      await tx.lance.updateMany({ where: { agrupamentoId: id }, data: { vencedor: false } });
      await tx.lance.update({ where: { id: lanceId }, data: { vencedor: true } });
      await tx.agrupamento.update({ where: { id }, data: { status: 'cotado' } });

      // Preço do vencedor → itens deste agrupamento
      await tx.pedidoItem.updateMany({
        where: { agrupamentoId: id },
        data: { precoUnitario: lance.precoUnitario },
      });

      // Recalcula cada pedido afetado; se todos os itens já foram cotados, move p/ "cotado"
      const pedidoIds = [...new Set(a.itens.map((i) => i.pedidoId))];
      for (const pedidoId of pedidoIds) {
        const pedido = await tx.pedido.findUnique({
          where: { id: pedidoId },
          include: { itens: { include: { agrupamento: true } } },
        });
        if (!pedido) continue;
        const total = pedido.itens.reduce(
          (s, it) => s + Number(it.precoUnitario) * it.quantidade,
          0,
        );
        const todosCotados = pedido.itens.every(
          (it) => it.agrupamento?.status === 'cotado' || it.agrupamento?.status === 'finalizado',
        );
        const validaAte = new Date();
        validaAte.setHours(validaAte.getHours() + 48);
        await tx.pedido.update({
          where: { id: pedidoId },
          data: {
            total,
            ...(todosCotados && pedido.status === 'aguardando_cotacao'
              ? {
                  status: 'cotado',
                  cotacaoEnviadaEm: new Date(),
                  cotacaoValidaAte: validaAte,
                  prazoEntregaDias: lance.prazoEntregaDias,
                }
              : {}),
          },
        });
        await tx.conta.updateMany({
          where: { pedidoId, tipo: 'pagar' },
          data: { valor: total },
        });
      }
    });

    return this.detalhe(id);
  }

  /** Admin fecha o agrupamento manualmente → entra em cotação. */
  async fechar(id: string) {
    const a = await this.prisma.agrupamento.findUnique({ where: { id } });
    if (!a) throw new NotFoundException('Agrupamento não encontrado');
    if (a.status !== 'aberto') {
      throw new BadRequestException('Só agrupamentos abertos podem ser fechados');
    }
    await this.prisma.agrupamento.update({
      where: { id },
      data: { status: 'em_cotacao', fechadoEm: new Date() },
    });
    return this.detalhe(id);
  }
}
