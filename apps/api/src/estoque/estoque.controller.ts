import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { criarMovimentacaoSchema, type CriarMovimentacaoInput } from '@insumia/shared';
import { EstoqueService } from './estoque.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthGuard, type AuthRequest } from '../common/auth.guard';

@ApiTags('estoque')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('estoque')
export class EstoqueController {
  constructor(private readonly estoque: EstoqueService) {}

  @Get()
  listResumo() {
    return this.estoque.listarResumo();
  }

  @Get('movimentacoes')
  listMovimentacoes() {
    return this.estoque.listarMovimentacoes();
  }

  @Post('movimentacoes')
  criar(
    @Req() req: AuthRequest,
    @Body(new ZodValidationPipe(criarMovimentacaoSchema)) dto: CriarMovimentacaoInput,
  ) {
    return this.estoque.criarMovimentacao(req.user.id, dto);
  }
}
