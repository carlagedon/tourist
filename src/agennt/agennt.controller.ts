import { Body, Controller, Param, Post } from '@nestjs/common';
import { AgenntService } from './agennt.service';

@Controller('agennt')
export class AgenntController {
  constructor(private readonly agenntService: AgenntService) {}

  @Post(':chatId/message')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body('message') message: string,
  ) {
    const result = await this.agenntService.runChat(chatId, message);
    return result;
  }
}
