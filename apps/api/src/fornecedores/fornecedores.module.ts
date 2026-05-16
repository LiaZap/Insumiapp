import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FornecedoresController } from './fornecedores.controller';
import { FornecedoresService } from './fornecedores.service';
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
  controllers: [FornecedoresController],
  providers: [FornecedoresService, AuthGuard],
})
export class FornecedoresModule {}
