import { Injectable } from "@nestjs/common";
import { CreateMessageDto } from "../dto/create_message.dto";
import { PrismaService } from "src/db/prisma.service";

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // async createMessage(chatId: number, dto: CreateMessageDto) {
  //   return await this.prisma.message.create({
  //     data: {
  //       role: dto.role,
  //       text: dto.text,
  //       chatId,
  //     },
  //   });
  // }
}