import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { CriarMovimentacaoInput, EstoqueResumo, EstoqueStatus } from '@insumia/shared';
import { PrismaService } from '../prisma/prisma.service';

const TIPOS_SAIDA = new Set(['saida', 'perda', 'transferencia']);

@Injectable()
export class EstoqueService {
  constructor(private readonly prisma: PrismaService) {}

  async listarResumo(): Promise<EstoqueResumo[]> {
    // Agrega EstoqueItem por medicamentoId (somando lotes)
    const items = await this.prisma.estoqueItem.findMany({
      include: { medicamento: true },
    });

    const byMed = new Map<string, EstoqueResumo>();
    for (const item of items) {
      const cur = byMed.get(item.medicamentoId);
      const med = item.medicamento;
      const qty = cur ? cur.quantidade + item.quantidade : item.quantidade;
      const status: EstoqueStatus =
        qty <= 0 ? 'esgotado' : qty < 10 ? 'baixo' : 'ok';
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
      });
    }
    return Array.from(byMed.values()).sort((a, b) =>
      a.medicamento.nome!.localeCompare(b.medicamento.nome!),
    );
  }

  async listarMovimentacoes() {
    return this.prisma.movimentacao.findMany({
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
