import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  DIAS_ALERTA_VALIDADE,
  type CriarMovimentacaoInput,
  type EstoqueResumo,
  type EstoqueStatus,
  type ValidadeStatus,
} from '@insumia/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config/config.service';

type EstoqueItemComMed = Prisma.EstoqueItemGetPayload<{ include: { medicamento: true } }>;

const TIPOS_SAIDA = new Set(['saida', 'perda', 'transferencia']);
const MS_DIA = 86_400_000;
const LIMIAR_BAIXO_PADRAO = 10;

@Injectable()
export class EstoqueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Estoque da clínica logada. */
  async listarResumo(usuarioId: string): Promise<EstoqueResumo[]> {
    const limiar = await this.config.getNumero('estoque.limiar_baixo', LIMIAR_BAIXO_PADRAO);
    const items = await this.prisma.estoqueItem.findMany({
      where: { usuarioId },
      include: { medicamento: true },
    });
    return this.agregarResumo(items, limiar);
  }

  /** Visão consolidada da operação — soma o estoque de TODAS as clínicas. */
  async listarConsolidado(): Promise<EstoqueResumo[]> {
    const limiar = await this.config.getNumero('estoque.limiar_baixo', LIMIAR_BAIXO_PADRAO);
    const items = await this.prisma.estoqueItem.findMany({
      include: { medicamento: true },
    });
    return this.agregarResumo(items, limiar);
  }

  /** Agrega EstoqueItem por medicamentoId (somando lotes/clínicas) → resumo + FEFO. */
  private agregarResumo(items: EstoqueItemComMed[], limiarBaixo: number): EstoqueResumo[] {
    // lote mais próximo de vencer por medicamento (FEFO)
    const proxValidade = new Map<string, { validade: Date; lote: string | null }>();
    for (const item of items) {
      if (!item.validade) continue;
      const cur = proxValidade.get(item.medicamentoId);
      if (!cur || item.validade < cur.validade) {
        proxValidade.set(item.medicamentoId, { validade: item.validade, lote: item.lote });
      }
    }

    const byMed = new Map<string, EstoqueResumo>();
    for (const item of items) {
      const cur = byMed.get(item.medicamentoId);
      const med = item.medicamento;
      const qty = cur ? cur.quantidade + item.quantidade : item.quantidade;
      const status: EstoqueStatus = qty <= 0 ? 'esgotado' : qty < limiarBaixo ? 'baixo' : 'ok';

      const prox = proxValidade.get(item.medicamentoId);
      let validadeStatus: ValidadeStatus = 'ok';
      let diasParaVencer: number | null = null;
      if (prox) {
        diasParaVencer = Math.floor((prox.validade.getTime() - Date.now()) / MS_DIA);
        validadeStatus =
          diasParaVencer < 0 ? 'vencido' : diasParaVencer <= DIAS_ALERTA_VALIDADE ? 'proximo' : 'ok';
      }

      byMed.set(item.medicamentoId, {
        medicamento: {
          id: med.id,
          nome: med.nome,
          fabricante: med.fabricante,
          apresentacao: med.apresentacao,
          dosagem: med.dosagem,
          categoria: med.categoria as never,
          principioAtivo: med.principioAtivo,
          precoUnitario: Number(med.precoUnitario),
          receituario: med.receituario,
        },
        quantidade: qty,
        status,
        atualizadoEm: cur?.atualizadoEm ?? item.atualizadoEm.toISOString(),
        proximaValidade: prox?.validade.toISOString() ?? null,
        lote: prox?.lote ?? null,
        validadeStatus,
        diasParaVencer,
      });
    }
    return Array.from(byMed.values()).sort((a, b) =>
      a.medicamento.nome!.localeCompare(b.medicamento.nome!),
    );
  }

  /** Movimentações da clínica, ou de toda a operação quando `usuarioId` é omitido. */
  async listarMovimentacoes(usuarioId?: string) {
    return this.prisma.movimentacao.findMany({
      where: usuarioId ? { usuarioId } : undefined,
      orderBy: { criadoEm: 'desc' },
      include: {
        medicamento: true,
        usuario: { select: { id: true, nome: true } },
      },
      take: 100,
    });
  }

  async criarMovimentacao(usuarioId: string, dto: CriarMovimentacaoInput) {
    const med = await this.prisma.medicamento.findUnique({
      where: { id: dto.medicamentoId },
    });
    if (!med) throw new NotFoundException('Medicamento não encontrado');

    return this.prisma.$transaction(async (tx) => {
      // Localiza ou cria EstoqueItem (procurando por lote NULL quando dto não traz)
      let item = await tx.estoqueItem.findFirst({
        where: {
          usuarioId,
          medicamentoId: dto.medicamentoId,
          lote: dto.lote ?? null,
        },
      });

      const delta = TIPOS_SAIDA.has(dto.tipo) ? -dto.quantidade : dto.quantidade;
      const novaQty = (item?.quantidade ?? 0) + delta;
      if (novaQty < 0) {
        throw new BadRequestException(
          `Estoque insuficiente. Atual: ${item?.quantidade ?? 0}, tentativa de saída: ${dto.quantidade}`,
        );
      }

      if (!item) {
        item = await tx.estoqueItem.create({
          data: {
            usuarioId,
            medicamentoId: dto.medicamentoId,
            lote: dto.lote ?? null,
            validade: dto.validade ? new Date(dto.validade) : null,
            quantidade: novaQty,
          },
        });
      } else {
        item = await tx.estoqueItem.update({
          where: { id: item.id },
          data: { quantidade: novaQty },
        });
      }

      const mov = await tx.movimentacao.create({
        data: {
          medicamentoId: dto.medicamentoId,
          usuarioId,
          tipo: dto.tipo,
          quantidade: dto.quantidade,
          lote: dto.lote,
          validade: dto.validade ? new Date(dto.validade) : null,
          motivo: dto.motivo,
        },
        include: {
          medicamento: true,
          usuario: { select: { id: true, nome: true } },
        },
      });

      return mov;
    });
  }
}
