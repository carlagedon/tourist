import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { UpdateChatDto } from './dto/update_chat.dto';
import { MessageRole } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteChat(id: string) {
    return this.prisma.chatSession.delete({ where: { id } });
  }

  async getChats() {
    return this.prisma.chatSession.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getChatById(id: string) {
    const chat = await this.prisma.chatSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }, // История от старых к новым
        },
      },
    });

    if (!chat) {
      throw new NotFoundException(`Сессия чата с ID ${id} не найдена`);
    }

    return chat;
  }

  async updateChatTitle(id: string, dto: UpdateChatDto) {
    const chat = await this.prisma.chatSession.findUnique({ where: { id } });
    if (!chat) {
      throw new NotFoundException(`Сессия чата с ID ${id} не найдена`);
    }

    return this.prisma.chatSession.update({
      where: { id },
      data: { title: dto.title },
    });
  }

  async saveMessage(chatId: string, role: MessageRole, text: string) {
    const chatExists = await this.prisma.chatSession.findUnique({
      where: { id: chatId },
    });
    if (!chatExists) {
      throw new NotFoundException(`Сессия чата ${chatId} не найдена`);
    }

    return this.prisma.message.create({
      data: {
        chatId,
        role,
        text,
      },
      include: {
        chat: true,
      },
    });
  }

  async getMessages(chatId: string) {
    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createChat() {
    const chat = await this.prisma.chatSession.create({
      data: {},
    });
    return { chatId: chat.id };
  }
}
