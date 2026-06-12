import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateRouteDto {
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
}
