import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateAskGuide {
  @IsNumber()
  @ApiProperty({
    example: 1,
  })
  locationId: number;

  @IsString()
  @ApiProperty({
    example: "Что случилось с акыном?",
  })
  question: string;
}