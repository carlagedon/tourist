import { PartialType } from '@nestjs/swagger';
import { CreateChatDto } from './create_chat.dto';

export class UpdateChatDto extends PartialType(CreateChatDto) {}
