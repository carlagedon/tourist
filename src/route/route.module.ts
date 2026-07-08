import { Module } from '@nestjs/common';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { PrismaModule } from 'src/db/prisma.module';

@Module({
  controllers: [RouteController],
  providers: [RouteService],
  imports: [PrismaModule],
  exports: [RouteService]
})
export class RouteModule {}
