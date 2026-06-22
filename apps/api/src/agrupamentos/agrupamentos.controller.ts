import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  criarLanceAdminSchema,
  criarLancePublicoSchema,
  finalizarAgrupamentoSchema,
  type CriarLanceAdminInput,
  type CriarLancePublicoInput,
  type FinalizarAgrupamentoInput,
} from '@insumia/shared';
import { AgrupamentosService } from './agrupamentos.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdminGuard } from '../common/admin.guard';

// Operação de cotação/agrupamento é exclusiva do back-office (admin).
@ApiTags('agrupamentos')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('agrupamentos')
export class AgrupamentosController {
  constructor(private readonly agrupamentos: AgrupamentosService) {}

  @Get()
  listar(@Query('status') status?: string) {
    return this.agrupamentos.listar(status);
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
  escolherVencedor(@Param('id') id: string, @Param('lanceId') lanceId: string) {
    return this.agrupamentos.escolherVencedor(id, lanceId);
  }

  @Patch(':id/finalizar')
  finalizar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(finalizarAgrupamentoSchema)) dto: FinalizarAgrupamentoInput,
  ) {
    return this.agrupamentos.finalizar(id, dto);
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
