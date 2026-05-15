import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
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
  controllers: [PedidosController],
  providers: [PedidosService, AuthGuard],
})
export class PedidosModule {}
