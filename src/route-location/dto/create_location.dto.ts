import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRouteLocationDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  routeId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  locationId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
  })
  stepOrder: number;
}
