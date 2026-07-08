import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class DragAndDropDto {
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'ID маршрута'
  })
  routeId: number;

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'ID локации'
  })
  locationId: number;

  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'Порядок шага'
  })
  stepOrder: number;
  
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
    description: 'Время прибытия'
  })
  arrivalTime?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 1,
    description: 'Длительность в минутах'
  })
  durationMinutes?: number;
}
