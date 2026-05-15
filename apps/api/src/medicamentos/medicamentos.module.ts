import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MedicamentosController } from './medicamentos.controller';
import { MedicamentosService } from './medicamentos.service';
import { AuthGuard } from '../common/auth.guard';

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
  controllers: [MedicamentosController],
  providers: [MedicamentosService, AuthGuard],
})
export class MedicamentosModule {}
