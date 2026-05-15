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
    };
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
