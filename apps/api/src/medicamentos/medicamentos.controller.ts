import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  buscaMedicamentoSchema,
  upsertMedicamentoSchema,
  type BuscaMedicamentoInput,
  type UpsertMedicamentoInput,
} from '@insumia/shared';
import { MedicamentosService } from './medicamentos.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthGuard, type AuthRequest } from '../common/auth.guard';
import { AdminGuard } from '../common/admin.guard';

type UpsertMedicamento = UpsertMedicamentoInput;

@ApiTags('medicamentos')
@ApiBearerAuth()
@Controller('medicamentos')
export class MedicamentosController {
  constructor(private readonly service: MedicamentosService) {}

  // Autenticado (e nao publico): o custo so volta para operador (admin/financeiro).
  @Get()
  @UseGuards(AuthGuard)
  buscar(
    @Req() req: AuthRequest,
    @Query(new ZodValidationPipe(buscaMedicamentoSchema)) input: BuscaMedicamentoInput,
  ) {
    return this.service.buscar(input, req.user.role);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  criar(@Body(new ZodValidationPipe(upsertMedicamentoSchema)) dto: UpsertMedicamento) {
    return this.service.criar(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  atualizar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(upsertMedicamentoSchema.partial())) dto: Partial<UpsertMedicamento>,
  ) {
    return this.service.atualizar(id, dto);
  }
}
