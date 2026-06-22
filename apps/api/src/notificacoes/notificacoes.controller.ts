import { Controller, Get, HttpCode, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificacoesService } from './notificacoes.service';
import { AuthGuard, type AuthRequest } from '../common/auth.guard';

@ApiTags('notificacoes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoes: NotificacoesService) {}

  @Get()
  listar(@Req() req: AuthRequest) {
    return this.notificacoes.listar(req.user.id);
  }

  @Get('nao-lidas')
  naoLidas(@Req() req: AuthRequest) {
    return this.notificacoes.naoLidas(req.user.id);
  }

  @Patch(':id/lida')
  marcarLida(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.notificacoes.marcarLida(req.user.id, id);
  }

  @Post('lidas')
  @HttpCode(204)
  async marcarTodasLidas(@Req() req: AuthRequest) {
    await this.notificacoes.marcarTodasLidas(req.user.id);
  }
}
