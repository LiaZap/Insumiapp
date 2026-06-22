import { Body, Controller, Delete, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthGuard, type AuthRequest } from '../common/auth.guard';
import { PushService } from './push.service';

const registrarSchema = z.object({
  token: z.string().min(10),
  plataforma: z.enum(['ios', 'android']),
});

const removerSchema = z.object({
  token: z.string().min(10),
});

@ApiTags('push')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('push')
export class PushController {
  constructor(private readonly push: PushService) {}

  @Post('register')
  @HttpCode(204)
  async registrar(
    @Req() req: AuthRequest,
    @Body(new ZodValidationPipe(registrarSchema)) dto: { token: string; plataforma: 'ios' | 'android' },
  ) {
    await this.push.registrarToken(req.user.id, dto.token, dto.plataforma);
  }

  @Delete('token')
  @HttpCode(204)
  async remover(
    @Body(new ZodValidationPipe(removerSchema)) dto: { token: string },
  ) {
    await this.push.removerToken(dto.token);
  }
}
