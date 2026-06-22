import { Body, Controller, Delete, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from '@insumia/shared';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthGuard, type AuthRequest } from '../common/auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  @HttpCode(201)
  async signup(@Body(new ZodValidationPipe(signupSchema)) dto: SignupInput) {
    return this.auth.signup(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginInput) {
    return this.auth.login(dto);
  }

  /** Exclusão definitiva da conta — exigência da App Store (Guideline 5.1.1(v)). */
  @Delete('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async deleteAccount(@Req() req: AuthRequest) {
    await this.auth.deleteAccount(req.user.id);
  }
}
