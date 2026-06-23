import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  atualizarConfiguracoesSchema,
  type AtualizarConfiguracoesInput,
} from '@insumia/shared';
import { ConfigService } from './config.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdminGuard } from '../common/admin.guard';

@ApiTags('configuracoes')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('configuracoes')
export class ConfiguracoesController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  listar() {
    return this.config.listar();
  }

  @Patch()
  atualizar(
    @Body(new ZodValidationPipe(atualizarConfiguracoesSchema)) dto: AtualizarConfiguracoesInput,
  ) {
    return this.config.upsertMany(dto.itens);
  }
}
