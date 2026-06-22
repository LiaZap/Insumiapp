import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  buscaAgrupamentoSchema,
  criarLanceAdminSchema,
  criarLancePublicoSchema,
  finalizarAgrupamentoSchema,
  type BuscaAgrupamentoInput,
  type CriarLanceAdminInput,
  type CriarLancePublicoInput,
  type FinalizarAgrupamentoInput,
} from '@insumia/shared';
import { AgrupamentosService } from './agrupamentos.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdminGuard, type AdminRequest } from '../common/admin.guard';

// Operação de cotação/agrupamento é exclusiva do back-office (admin).
@ApiTags('agrupamentos')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('agrupamentos')
export class AgrupamentosController {
  constructor(private readonly agrupamentos: AgrupamentosService) {}

  @Get()
  listar(@Query(new ZodValidationPipe(buscaAgrupamentoSchema)) q: BuscaAgrupamentoInput) {
    return this.agrupamentos.listar(q.status);
  }

  @Get(':id')
  detalhe(@Param('id') id: string) {
    return this.agrupamentos.detalhe(id);
  }

  @Patch(':id/fechar')
  fechar(@Param('id') id: string) {
    return this.agrupamentos.fechar(id);
  }

  @Post(':id/lances')
  criarLance(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarLanceAdminSchema)) dto: CriarLanceAdminInput,
  ) {
    return this.agrupamentos.criarLanceAdmin(id, dto);
  }

  @Post(':id/escolher/:lanceId')
  escolherVencedor(
    @Req() req: AdminRequest,
    @Param('id') id: string,
    @Param('lanceId') lanceId: string,
  ) {
    return this.agrupamentos.escolherVencedor(id, lanceId, req.user.id);
  }

  @Patch(':id/finalizar')
  finalizar(
    @Req() req: AdminRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(finalizarAgrupamentoSchema)) dto: FinalizarAgrupamentoInput,
  ) {
    return this.agrupamentos.finalizar(id, dto, req.user.id);
  }
}

/** Endpoints públicos — fornecedor dá lance sem login (via publicToken). */
@ApiTags('agrupamentos-publico')
@Controller('publico/agrupamentos')
export class AgrupamentosPublicoController {
  constructor(private readonly agrupamentos: AgrupamentosService) {}

  @Get(':token')
  info(@Param('token') token: string) {
    return this.agrupamentos.publico(token);
  }

  @Post(':token/lance')
  lance(
    @Param('token') token: string,
    @Body(new ZodValidationPipe(criarLancePublicoSchema)) dto: CriarLancePublicoInput,
  ) {
    return this.agrupamentos.criarLancePublico(token, dto);
  }
}
