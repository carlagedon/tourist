import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { UpdateChatDto } from './dto/update_chat.dto';
import { CreateMessageDto } from './dto/create_message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}


  @Post()
  async createChat() {
    return this.chatService.createChat();
  }

  @Get()
  async getAllChats() {
    return this.chatService.getChats();
  }
  @Get(':id')
  async getChatById(@Param('id') id: string) {
    return this.chatService.getChatById(id);
  }

  @Get(':chatId/message')
  async getMessage(@Param('chatId') chatId: string) {
    return this.chatService.getMessages(chatId);
  }

  @Patch(':id/title')
  async updateTitle(@Param('id') id: string, @Body() dto: UpdateChatDto) {
    return this.chatService.updateChatTitle(id, dto);
  }

  @Delete(':id')
  async deleteChat(@Param('id') id: string) {
    return this.chatService.deleteChat(id);
  }
}
