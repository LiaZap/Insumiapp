import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { criarFornecedorSchema, type CriarFornecedorInput } from '@insumia/shared';
import { FornecedoresService } from './fornecedores.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthGuard } from '../common/auth.guard';

@ApiTags('fornecedores')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('fornecedores')
export class FornecedoresController {
  constructor(private readonly fornecedores: FornecedoresService) {}

  @Get()
  listar() {
    return this.fornecedores.listar();
  }

  @Post()
  criar(@Body(new ZodValidationPipe(criarFornecedorSchema)) dto: CriarFornecedorInput) {
    return this.fornecedores.criar(dto);
  }

  @Patch(':id')
  atualizar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(criarFornecedorSchema.partial())) dto: Partial<CriarFornecedorInput>,
  ) {
    return this.fornecedores.atualizar(id, dto);
  }
}
