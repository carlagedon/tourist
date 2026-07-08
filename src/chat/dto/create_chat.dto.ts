import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'My chat' })
  title?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 1
  })
  userId?: number;
}