import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  buscaContaSchema,
  criarContaSchema,
  type BuscaContaInput,
  type CriarContaInput,
} from '@insumia/shared';
import { FinanceiroService } from './financeiro.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthGuard, type AuthRequest } from '../common/auth.guard';

@ApiTags('financeiro')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly fin: FinanceiroService) {}

  @Get('contas')
  list(@Query(new ZodValidationPipe(buscaContaSchema)) q: BuscaContaInput) {
    return this.fin.listar(q);
  }

  @Post('contas')
  create(@Body(new ZodValidationPipe(criarContaSchema)) dto: CriarContaInput) {
    return this.fin.criar(dto);
  }

  @Patch('contas/:id/pagar')
  pagar(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.fin.marcarPaga(id, req.user.id);
  }

  @Patch('contas/:id/cancelar')
  cancelar(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.fin.cancelar(id, req.user.id);
  }

  @Get('dashboard')
  dashboard() {
    return this.fin.dashboard();
  }
}
