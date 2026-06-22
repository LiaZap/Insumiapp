import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import {
  criarPedidoSchema,
  enviarCotacaoSchema,
  pedidoStatusSchema,
  type CriarPedidoInput,
  type EnviarCotacaoInput,
  type PedidoStatus,
} from '@insumia/shared';
import { PedidosService } from './pedidos.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthGuard, type AuthRequest } from '../common/auth.guard';
import { AdminGuard } from '../common/admin.guard';

const atualizarStatusSchema = z.object({ status: pedidoStatusSchema });

function isOperador(role: string): boolean {
  return role === 'admin' || role === 'financeiro';
}

@ApiTags('pedidos')
@ApiBearerAuth()
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidos: PedidosService) {}

  @Get()
  @UseGuards(AuthGuard)
  list(@Req() req: AuthRequest, @Query('escopo') escopo?: string) {
    // `escopo=todos` (ver todos os pedidos) é só de admin/financeiro;
    // comprador sempre cai na lista dos próprios.
    if (escopo === 'todos' && isOperador(req.user.role)) return this.pedidos.listAll();
    return this.pedidos.list(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  detail(@Req() req: AuthRequest, @Param('id') id: string) {
    // findById valida posse (anti-IDOR) — comprador só vê o próprio.
    return this.pedidos.findById(id, req.user);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Req() req: AuthRequest,
    @Body(new ZodValidationPipe(criarPedidoSchema)) dto: CriarPedidoInput,
  ) {
    return this.pedidos.criar(req.user.id, dto);
  }

  /** Admin avança o status do pedido. */
  @Patch(':id/status')
  @UseGuards(AdminGuard)
  atualizarStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarStatusSchema)) body: { status: PedidoStatus },
  ) {
    return this.pedidos.atualizarStatus(id, body.status);
  }

  /** Admin envia a cotação. */
  @Patch(':id/cotacao')
  @UseGuards(AdminGuard)
  enviarCotacao(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(enviarCotacaoSchema)) dto: EnviarCotacaoInput,
  ) {
    return this.pedidos.enviarCotacao(id, dto);
  }

  /** Cliente aceita a cotação do próprio pedido. */
  @Post(':id/cotacao/aceitar')
  @UseGuards(AuthGuard)
  aceitarCotacao(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.pedidos.aceitarCotacao(id, req.user.id);
  }

  /** Cliente recusa a cotação do próprio pedido. */
  @Post(':id/cotacao/recusar')
  @UseGuards(AuthGuard)
  recusarCotacao(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.pedidos.recusarCotacao(id, req.user.id);
  }
}
