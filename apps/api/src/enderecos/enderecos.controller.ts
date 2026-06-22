import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  atualizarEnderecoSchema,
  criarEnderecoSchema,
  type AtualizarEnderecoInput,
  type CriarEnderecoInput,
} from '@insumia/shared';
import { EnderecosService } from './enderecos.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthGuard, type AuthRequest } from '../common/auth.guard';

@ApiTags('enderecos')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('enderecos')
export class EnderecosController {
  constructor(private readonly enderecos: EnderecosService) {}

  @Get()
  listar(@Req() req: AuthRequest) {
    return this.enderecos.listar(req.user.id);
  }

  @Post()
  criar(
    @Req() req: AuthRequest,
    @Body(new ZodValidationPipe(criarEnderecoSchema)) dto: CriarEnderecoInput,
  ) {
    return this.enderecos.criar(req.user.id, dto);
  }

  @Patch(':id')
  atualizar(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(atualizarEnderecoSchema)) dto: AtualizarEnderecoInput,
  ) {
    return this.enderecos.atualizar(req.user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remover(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.enderecos.remover(req.user.id, id);
  }
}
