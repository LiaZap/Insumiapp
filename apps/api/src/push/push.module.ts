import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [PushController],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
