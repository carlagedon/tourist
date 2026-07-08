import { ApiProperty } from '@nestjs/swagger';
import { MessageRole } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsEnum(MessageRole)
  @ApiProperty({
    example: MessageRole.USER,
  })
  role: MessageRole;

  @ApiProperty({
    example: 'Хочу поехать в Боровое',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
