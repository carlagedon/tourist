import { Module } from '@nestjs/common';
import { RouteLocationService } from './route-location.service';
import { RouteLocationController } from './route-location.controller';
import { PrismaModule } from 'src/db/prisma.module';

@Module({
  controllers: [RouteLocationController],
  providers: [RouteLocationService],
  imports: [PrismaModule]
})
export class RouteLocationModule {}
