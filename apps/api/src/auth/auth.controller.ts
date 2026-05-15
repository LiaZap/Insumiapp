import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from '@insumia/shared';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';

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
}
