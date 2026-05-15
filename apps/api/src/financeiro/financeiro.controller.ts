import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { criarContaSchema, type CriarContaInput } from '@insumia/shared';
import { FinanceiroService } from './financeiro.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthGuard } from '../common/auth.guard';

@ApiTags('financeiro')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly fin: FinanceiroService) {}

  @Get('contas')
  list(@Query('tipo') tipo?: string, @Query('status') status?: string) {
    return this.fin.listar({
      tipo: tipo === 'pagar' || tipo === 'receber' ? tipo : undefined,
      status,
    });
  }

  @Post('contas')
  create(@Body(new ZodValidationPipe(criarContaSchema)) dto: CriarContaInput) {
    return this.fin.criar(dto);
  }

  @Patch('contas/:id/pagar')
  pagar(@Param('id') id: string) {
    return this.fin.marcarPaga(id);
  }

  @Patch('contas/:id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.fin.cancelar(id);
  }

  @Get('dashboard')
  dashboard() {
    return this.fin.dashboard();
  }
}
