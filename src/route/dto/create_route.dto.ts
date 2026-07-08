import { ApiProperty } from '@nestjs/swagger';
import { RouteStatus } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @ApiProperty({example: "title"})
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Активно-познавательный тур в Боровом на 3 дня',
  })
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Кокшетау',
  })
  startCity: string;

  @IsString()
  @IsUrl()
  @ApiProperty({
    example:
      'https://ybis.ru/wp-content/uploads/2023/09/borovoe-kazakhstan-poselok-burabai-1.webp',
  })
  imageUrl: string;

  @IsEnum(RouteStatus)
  @ApiProperty({ example: RouteStatus.DRAFT })
  status: RouteStatus;

  @IsNumber()
  @ApiProperty({ example: 100 })
  totalCost: number;
}
