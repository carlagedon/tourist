import { PartialType } from "@nestjs/swagger";
import { CreateRouteDto } from "./create_route.dto";

export class UpdateRouteDto extends PartialType(CreateRouteDto) {}