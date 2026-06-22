import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AgrupamentosController, AgrupamentosPublicoController } from './agrupamentos.controller';
import { AgrupamentosService } from './agrupamentos.service';
import { AuthGuard } from '../common/auth.guard';
import { AdminGuard } from '../common/admin.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET', 'dev-secret'),
      }),
    }),
  ],
  controllers: [AgrupamentosController, AgrupamentosPublicoController],
  providers: [AgrupamentosService, AuthGuard, AdminGuard],
  exports: [AgrupamentosService],
})
export class AgrupamentosModule {}
