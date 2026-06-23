import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule as NestConfigModule, ConfigService as NestConfigService } from '@nestjs/config';
import { ConfigService } from './config.service';
import { ConfiguracoesController } from './configuracoes.controller';
import { AdminGuard } from '../common/admin.guard';

// Global: ConfigService injetável em qualquer serviço (estoque, agrupamentos...).
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [NestConfigModule],
      inject: [NestConfigService],
      useFactory: (cfg: NestConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET', 'dev-secret'),
      }),
    }),
  ],
  controllers: [ConfiguracoesController],
  providers: [ConfigService, AdminGuard],
  exports: [ConfigService],
})
export class ConfigModule {}
