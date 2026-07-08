import { ApiProperty } from "@nestjs/swagger"
import { LocationTag, LocationType } from "@prisma/client"
import { IsArray, IsEnum, IsNumber, IsString, IsNotEmpty, IsBoolean } from "class-validator"

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

  @IsNumber()
  @ApiProperty({example: 100})
  priceValue: number

  @IsBoolean()
  @ApiProperty({example: false})
  isFree: boolean

  @IsArray()
  @IsEnum(LocationTag, { each: true })
  @ApiProperty({example: [LocationTag.NATURE, LocationTag.FAMILY]})  
  tags: LocationTag[]

  @IsString()
  @IsNotEmpty()
  @ApiProperty({example: "Short context of the location"})
  shortContext: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({example: "Lore context of the location"})
  loreContext: string
}