import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { MedicamentosModule } from './medicamentos/medicamentos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { EstoqueModule } from './estoque/estoque.module';
import { FinanceiroModule } from './financeiro/financeiro.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    MedicamentosModule,
    PedidosModule,
    EstoqueModule,
    FinanceiroModule,
  ],
})
export class AppModule {}
