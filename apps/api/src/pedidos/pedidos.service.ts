import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  NEXT_STATUS_MANUAL,
  type CriarPedidoInput,
  type EnviarCotacaoInput,
  type PedidoStatus,
} from '@insumia/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AgrupamentosService } from '../agrupamentos/agrupamentos.service';
import { PushService } from '../push/push.service';
import { AuditService } from '../audit/audit.service';

const STATUS_PUSH_LABEL: Record<PedidoStatus, string | null> = {
  rascunho: null,
  aguardando_cotacao: null,
  cotado: 'Cotação recebida — revise e aprove no app.',
  confirmado: 'Pedido aprovado, vamos preparar o envio.',
  em_separacao: 'Seu pedido está sendo separado.',
  enviado: 'Pedido a caminho da clínica.',
  entregue: 'Pedido entregue. Confira a nota fiscal no app.',
  cancelado: 'Pedido cancelado.',
};

const PEDIDO_INCLUDE = {
  itens: { include: { medicamento: true } },
  usuario: { select: { id: true, nome: true, empresa: true, email: true } },
} as const;

@Injectable()
export class PedidosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
    private readonly audit: AuditService,
  ) {}

  /** Dispara push de atualização de status pro dono do pedido. */
  private async notificar(pedidoId: string, status: PedidoStatus): Promise<void> {
    const msg = STATUS_PUSH_LABEL[status];
    if (!msg) return;
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: { usuarioId: true, numero: true },
    });
    if (!pedido) return;
    await this.push.enviarParaUsuario(
      pedido.usuarioId,
      `Pedido ${pedido.numero}`,
      msg,
      { tipo: 'pedido', pedidoId },
    );
  }

  /** Snapshot textual do endereço, congelado no momento do pedido. */
  private formatarEndereco(e: {
    apelido: string;
    logradouro: string;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string;
    uf: string;
    cep: string;
  }): string {
    const linha1 = [e.logradouro, e.numero].filter(Boolean).join(', ');
    const linha2 = [e.bairro, `${e.cidade}/${e.uf}`].filter(Boolean).join(' - ');
    const partes = [`${e.apelido}:`, linha1, e.complemento, linha2, `CEP ${e.cep}`].filter(Boolean);
    return partes.join(' • ');
  }

  async list(usuarioId: string) {
    return this.prisma.pedido.findMany({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' },
      include: {
        itens: { include: { medicamento: true } },
      },
    });
  }

  /** Lista TODOS os pedidos — usado pelo back-office. */
  async listAll() {
    return this.prisma.pedido.findMany({
      orderBy: { criadoEm: 'desc' },
      include: {
        itens: { include: { medicamento: true } },
        usuario: { select: { id: true, nome: true, empresa: true, email: true } },
      },
    });
  }

  async atualizarStatus(id: string, status: PedidoStatus, atorId?: string) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id } });
    if (!pedido) throw new NotFoundException('Pedido não encontrado');

    // Máquina de estados: só permite transições manuais válidas (evita pulos
    // e regressões, ex.: entregue → rascunho).
    if (!NEXT_STATUS_MANUAL[pedido.status].includes(status)) {
      throw new BadRequestException(
        `Transição de status inválida: ${pedido.status} → ${status}`,
      );
    }

    const atualizado = await this.prisma.$transaction(async (tx) => {
      const p = await tx.pedido.update({
        where: { id },
        data: { status },
        include: {
          itens: { include: { medicamento: true } },
          usuario: { select: { id: true, nome: true, empresa: true, email: true } },
        },
      });
      // Cancelar o pedido cancela a conta a pagar vinculada (igual recusarCotacao).
      if (status === 'cancelado') {
        await tx.conta.updateMany({
          where: { pedidoId: id, status: { in: ['aberta', 'vencida'] } },
          data: { status: 'cancelada' },
        });
      }
      return p;
    });
    await this.notificar(id, status);
    await this.audit.registrar({
      atorId,
      acao: 'pedido.status',
      entidade: 'Pedido',
      entidadeId: id,
      antes: { status: pedido.status },
      depois: { status },
    });
    return atualizado;
  }

  async findById(id: string, requester?: { id: string; role: string }) {
    const p = await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nome: true, empresa: true, email: true } },
        itens: {
          include: {
            medicamento: true,
            agrupamento: { include: { lances: { where: { vencedor: true } } } },
          },
        },
      },
    });
    if (!p) throw new NotFoundException('Pedido não encontrado');

    // Anti-IDOR: comprador só acessa o próprio pedido; admin/financeiro veem todos.
    // 404 (não 403) para não revelar a existência do recurso a terceiros.
    if (
      requester &&
      requester.role !== 'admin' &&
      requester.role !== 'financeiro' &&
      p.usuarioId !== requester.id
    ) {
      throw new NotFoundException('Pedido não encontrado');
    }

    // Anexa a rastreabilidade (vem do agrupamento finalizado de cada item)
    return {
      ...p,
      itens: p.itens.map((it) => {
        const ag = it.agrupamento;
        const rastreabilidade =
          ag?.finalizadoEm != null
            ? {
                lote: ag.lote,
                validade: ag.validade?.toISOString() ?? null,
                fabricante: ag.fabricante,
                notaFiscal: ag.notaFiscal,
                fornecedor: ag.lances[0]?.fornecedorNome ?? null,
              }
            : null;
        return { ...it, rastreabilidade };
      }),
    };
  }

  /** Admin envia a cotação: define preço/disponibilidade por item, prazo e validade. */
  async enviarCotacao(id: string, dto: EnviarCotacaoInput, atorId?: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { itens: true },
    });
    if (!pedido) throw new NotFoundException('Pedido não encontrado');
    if (pedido.status !== 'aguardando_cotacao' && pedido.status !== 'cotado') {
      throw new BadRequestException('Pedido não está em fase de cotação');
    }

    const itemMap = new Map(pedido.itens.map((i) => [i.id, i]));
    let total = 0;

    await this.prisma.$transaction(async (tx) => {
      for (const ci of dto.itens) {
        const item = itemMap.get(ci.itemId);
        if (!item) throw new NotFoundException(`Item ${ci.itemId} não encontrado`);
        if (ci.disponivel) total += ci.precoUnitario * item.quantidade;
        await tx.pedidoItem.update({
          where: { id: ci.itemId },
          data: { precoUnitario: ci.precoUnitario, disponivel: ci.disponivel },
        });
      }

      const validaAte = new Date();
      validaAte.setHours(validaAte.getHours() + dto.validadeHoras);

      await tx.pedido.update({
        where: { id },
        data: {
          status: 'cotado',
          total,
          prazoEntregaDias: dto.prazoEntregaDias,
          cotacaoObservacao: dto.observacao,
          cotacaoEnviadaEm: new Date(),
          cotacaoValidaAte: validaAte,
          respondidaEm: null,
        },
      });

      // Atualiza a conta a pagar vinculada com o novo total
      await tx.conta.updateMany({
        where: { pedidoId: id, tipo: 'pagar' },
        data: { valor: total },
      });
    });

    await this.notificar(id, 'cotado');
    await this.audit.registrar({
      atorId,
      acao: 'pedido.cotacao',
      entidade: 'Pedido',
      entidadeId: id,
      depois: { prazoEntregaDias: dto.prazoEntregaDias, validadeHoras: dto.validadeHoras },
    });
    return this.findById(id);
  }

  /** Cliente aceita a cotação → pedido confirmado. */
  async aceitarCotacao(id: string, usuarioId: string) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id } });
    if (!pedido) throw new NotFoundException('Pedido não encontrado');
    // 404 (não 400) para não revelar a existência de pedidos de outras clínicas.
    if (pedido.usuarioId !== usuarioId) throw new NotFoundException('Pedido não encontrado');
    if (pedido.status !== 'cotado') throw new BadRequestException('Pedido não está cotado');
    if (pedido.cotacaoValidaAte && pedido.cotacaoValidaAte < new Date()) {
      throw new BadRequestException('Cotação expirada');
    }
    await this.prisma.pedido.update({
      where: { id },
      data: { status: 'confirmado', respondidaEm: new Date() },
    });
    return this.findById(id);
  }

  /** Cliente recusa a cotação → pedido cancelado. */
  async recusarCotacao(id: string, usuarioId: string) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id } });
    if (!pedido) throw new NotFoundException('Pedido não encontrado');
    // 404 (não 400) para não revelar a existência de pedidos de outras clínicas.
    if (pedido.usuarioId !== usuarioId) throw new NotFoundException('Pedido não encontrado');
    if (pedido.status !== 'cotado') throw new BadRequestException('Pedido não está cotado');
    await this.prisma.$transaction(async (tx) => {
      await tx.pedido.update({
        where: { id },
        data: { status: 'cancelado', respondidaEm: new Date() },
      });
      await tx.conta.updateMany({
        where: { pedidoId: id, status: { in: ['aberta', 'vencida'] } },
        data: { status: 'cancelada' },
      });
    });
    return this.findById(id);
  }

  async criar(usuarioId: string, dto: CriarPedidoInput) {
    const medicamentoIds = dto.itens.map((i) => i.medicamentoId);
    const meds = await this.prisma.medicamento.findMany({
      where: { id: { in: medicamentoIds } },
    });
    const medMap = new Map(meds.map((m) => [m.id, m]));

    const itens = dto.itens.map((i) => {
      const med = medMap.get(i.medicamentoId);
      if (!med) throw new NotFoundException(`Medicamento ${i.medicamentoId} não encontrado`);
      return {
        medicamentoId: i.medicamentoId,
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario ?? Number(med.precoUnitario),
        observacao: i.observacao,
      };
    });

    const total = itens.reduce(
      (sum, item) => sum + Number(item.precoUnitario) * item.quantidade,
      0,
    );

    // Destino de entrega: valida posse (anti-IDOR) e congela um snapshot
    // textual para preservar o histórico se o endereço mudar/for removido.
    let enderecoEntregaId: string | null = null;
    let enderecoEntregaTexto: string | null = null;
    if (dto.enderecoEntregaId) {
      const endereco = await this.prisma.endereco.findUnique({
        where: { id: dto.enderecoEntregaId },
      });
      if (!endereco || endereco.usuarioId !== usuarioId) {
        throw new BadRequestException('Endereço de entrega inválido');
      }
      enderecoEntregaId = endereco.id;
      enderecoEntregaTexto = this.formatarEndereco(endereco);
    }

    const numero = `PED-${Date.now().toString(36).toUpperCase()}`;

    const pedido = await this.prisma.$transaction(async (tx) => {
      const novo = await tx.pedido.create({
        data: {
          numero,
          status: 'aguardando_cotacao',
          total,
          observacao: dto.observacao,
          usuarioId,
          enderecoEntregaId,
          enderecoEntregaTexto,
          itens: { create: itens },
        },
        include: { itens: { include: { medicamento: true } } },
      });

      // Cada item entra no agrupamento ABERTO do seu medicamento (compra coletiva)
      for (const item of novo.itens) {
        const agrupamentoId = await AgrupamentosService.agrupamentoAbertoId(
          tx,
          item.medicamentoId,
        );
        await tx.pedidoItem.update({
          where: { id: item.id },
          data: { agrupamentoId },
        });
      }

      // Conta a pagar automática (vencimento +7 dias)
      const vencimento = new Date();
      vencimento.setDate(vencimento.getDate() + 7);
      await tx.conta.create({
        data: {
          tipo: 'pagar',
          descricao: `Pedido ${novo.numero}`,
          valor: total,
          vencimento,
          pedidoId: novo.id,
        },
      });

      return novo;
    });

    return pedido;
  }
}
