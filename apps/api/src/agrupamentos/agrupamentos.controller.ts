import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AgrupamentosService } from './agrupamentos.service';
import { AuthGuard } from '../common/auth.guard';

@ApiTags('agrupamentos')
@ApiBearerAuth()
@UseGuards(AuthGuard)
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
}
