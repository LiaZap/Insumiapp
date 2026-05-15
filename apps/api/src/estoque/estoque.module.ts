import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EstoqueController } from './estoque.controller';
import { EstoqueService } from './estoque.service';
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
  controllers: [EstoqueController],
  providers: [EstoqueService, AuthGuard],
})
export class EstoqueModule {}
