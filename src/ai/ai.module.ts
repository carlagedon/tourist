import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { VectorService } from './vector/vector.service';
import { LlmService } from './llm/llm.service';
import { PrismaModule } from 'src/db/prisma.module';

@Module({
  controllers: [AiController],
  providers: [AiService, VectorService, LlmService],
  exports: [VectorService],
  imports: [PrismaModule],
})
export class AiModule {}
