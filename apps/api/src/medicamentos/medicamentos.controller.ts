import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import {
  buscaMedicamentoSchema,
  medicamentoCategoriaSchema,
  type BuscaMedicamentoInput,
} from '@insumia/shared';
import { MedicamentosService } from './medicamentos.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdminGuard } from '../common/admin.guard';

const upsertMedicamentoSchema = z.object({
  nome: z.string().min(2),
  principioAtivo: z.string().optional().nullable(),
  fabricante: z.string().optional().nullable(),
  apresentacao: z.string().optional().nullable(),
  dosagem: z.string().optional().nullable(),
  categoria: medicamentoCategoriaSchema,
  precoUnitario: z.number().nonnegative(),
  ean: z.string().optional().nullable(),
  receituario: z.boolean().optional(),
});
type UpsertMedicamento = z.infer<typeof upsertMedicamentoSchema>;

@ApiTags('medicamentos')
@Controller('medicamentos')
export class MedicamentosController {
  constructor(private readonly service: MedicamentosService) {}

  @Get()
  buscar(@Query(new ZodValidationPipe(buscaMedicamentoSchema)) input: BuscaMedicamentoInput) {
    return this.service.buscar(input);
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
