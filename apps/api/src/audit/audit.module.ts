import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';

// Global: qualquer serviço pode injetar AuditService sem importar este módulo.
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
