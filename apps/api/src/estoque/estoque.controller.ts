import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { criarMovimentacaoSchema, type CriarMovimentacaoInput } from '@insumia/shared';
import { EstoqueService } from './estoque.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthGuard, type AuthRequest } from '../common/auth.guard';

// escopo=todos (visão consolidada) é só de admin/financeiro; comprador vê o seu.
function consolidado(req: AuthRequest, escopo?: string): boolean {
  return escopo === 'todos' && (req.user.role === 'admin' || req.user.role === 'financeiro');
}

@ApiTags('estoque')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('estoque')
export class EstoqueController {
  constructor(private readonly estoque: EstoqueService) {}

  @Get()
  listResumo(@Req() req: AuthRequest, @Query('escopo') escopo?: string) {
    if (consolidado(req, escopo)) return this.estoque.listarConsolidado();
    return this.estoque.listarResumo(req.user.id);
  }

  @Get('movimentacoes')
  listMovimentacoes(@Req() req: AuthRequest, @Query('escopo') escopo?: string) {
    if (consolidado(req, escopo)) return this.estoque.listarMovimentacoes();
    return this.estoque.listarMovimentacoes(req.user.id);
  }

  @Post('movimentacoes')
  criar(
    @Req() req: AuthRequest,
    @Body(new ZodValidationPipe(criarMovimentacaoSchema)) dto: CriarMovimentacaoInput,
  ) {
    return this.estoque.criarMovimentacao(req.user.id, dto);
  }
}
