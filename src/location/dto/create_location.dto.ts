import { ApiProperty } from "@nestjs/swagger"
import { LocationType } from "@prisma/client"
import { IsArray, IsEnum, IsNumber, IsString, IsNotEmpty } from "class-validator"

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({example: "Остров Жумбактас"})
  title: string

  @IsEnum(LocationType)
  @ApiProperty({example: LocationType.SIGHTSEEING})
  type: LocationType

  @IsArray()
  @IsNumber({}, { each: true })
  @ApiProperty({example: [53.087434, 70.252066]})
  coords: number[]

  @IsString()
  @IsNotEmpty()
  @ApiProperty({example: "History context of the location"})
  historyContext: string
}