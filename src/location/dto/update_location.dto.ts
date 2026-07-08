import { PartialType } from "@nestjs/swagger";
import { CreateLocationDto } from "./create_location.dto";

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}