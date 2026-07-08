import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from 'src/db/prisma.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [PrismaModule]
})
export class ChatModule {}
