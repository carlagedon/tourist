import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { PrismaModule } from 'src/db/prisma.module';
import { AiModule } from 'src/ai/ai.module';

@Module({
  controllers: [LocationController],
  providers: [LocationService],
  imports: [PrismaModule, AiModule],
  exports: [LocationService]
})
export class LocationModule {}
