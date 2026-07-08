import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { PrismaModule } from 'src/db/prisma.module';
import { AiModule } from 'src/ai/ai.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    AiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
