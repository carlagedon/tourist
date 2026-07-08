import { Module } from '@nestjs/common';
import { AgenntService } from './agennt.service';
import { AgenntController } from './agennt.controller';
import { PrismaModule } from 'src/db/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { LocationModule } from 'src/location/location.module';
import { AiModule } from 'src/ai/ai.module';
import { RouteModule } from 'src/route/route.module';

@Module({
  imports: [PrismaModule, ConfigModule, LocationModule, AiModule, RouteModule],
  controllers: [AgenntController],
  providers: [AgenntService],
})
export class AgenntModule {}
