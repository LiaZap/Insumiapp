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
  list(
    @Req() req: AuthRequest,
    @Query(new ZodValidationPipe(buscaContaSchema)) q: BuscaContaInput,
  ) {
    return this.fin.listar(q, req.user);
  }

  @Post('contas')
  create(
    @Req() req: AuthRequest,
    @Body(new ZodValidationPipe(criarContaSchema)) dto: CriarContaInput,
  ) {
    return this.fin.criar(dto, req.user);
  }

  @Patch('contas/:id/pagar')
  pagar(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.fin.marcarPaga(id, req.user);
  }

  @Patch('contas/:id/cancelar')
  cancelar(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.fin.cancelar(id, req.user);
  }

  @Get('dashboard')
  dashboard(@Req() req: AuthRequest) {
    return this.fin.dashboard(req.user);
  }
}
