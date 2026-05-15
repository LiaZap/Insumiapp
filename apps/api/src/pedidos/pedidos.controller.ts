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

const atualizarStatusSchema = z.object({ status: pedidoStatusSchema });

@ApiTags('pedidos')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidos: PedidosService) {}

  @Get()
  list(@Req() req: AuthRequest, @Query('escopo') escopo?: string) {
    if (escopo === 'todos') return this.pedidos.listAll();
    return this.pedidos.list(req.user.id);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.pedidos.findById(id);
  }

  @Post()
  create(
    @Req() req: AuthRequest,
    @Body(new ZodValidationPipe(criarPedidoSchema)) dto: CriarPedidoInput,
  ) {
    return this.pedidos.criar(req.user.id, dto);
  }

  @Patch(':id/status')
  atualizarStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarStatusSchema)) body: { status: PedidoStatus },
  ) {
    return this.pedidos.atualizarStatus(id, body.status);
  }

  /** Admin envia a cotação. */
  @Patch(':id/cotacao')
  enviarCotacao(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(enviarCotacaoSchema)) dto: EnviarCotacaoInput,
  ) {
    return this.pedidos.enviarCotacao(id, dto);
  }

  /** Cliente aceita a cotação. */
  @Post(':id/cotacao/aceitar')
  aceitarCotacao(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.pedidos.aceitarCotacao(id, req.user.id);
  }

  /** Cliente recusa a cotação. */
  @Post(':id/cotacao/recusar')
  recusarCotacao(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.pedidos.recusarCotacao(id, req.user.id);
  }
}
