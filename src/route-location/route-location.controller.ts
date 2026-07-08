import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { RouteLocationService } from './route-location.service';
import { CreateRouteLocationDto } from './dto/create_location.dto';
import { DragAndDropDto } from './dto/drag_and_drop.dto';

@Controller('route-location')
export class RouteLocationController {
  constructor(private readonly routeLocationService: RouteLocationService) {}

  @Post()
  async createRouteLocation(@Body() dto: CreateRouteLocationDto) {
    return await this.routeLocationService.createRouteLocation(dto);
  }

  @Get()
  async getAllRouteLocations() {
    return await this.routeLocationService.getAllRouteLocations();
  }

  @Get(':routeId/:locationId')
  async getRouteLocationById(
    @Param('routeId') routeId: number,
    @Param('locationId') locationId: number,
  ) {
    return await this.routeLocationService.getRouteLocationById(
      routeId,
      locationId,
    );
  }

  @Patch(':routeId/:locationId')
  async updateRouteLocation(
    @Param('routeId') routeId: number,
    @Param('locationId') locationId: number,
    @Body() dto: CreateRouteLocationDto,
  ) {
    return await this.routeLocationService.updateRouteLocation(
      routeId,
      locationId,
      dto,
    );
  }

  @Delete(':routeId/stops/:locationId')
  removeStop(
    @Param('routeId', ParseIntPipe) routeId: number,
    @Param('locationId', ParseIntPipe) locationId: number,
  ) {
    return this.routeLocationService.removeStop(routeId, locationId);
  }

  @Get(':routeId')
  async findRouteLocationByRouteId(@Param('routeId') routeId: number) {
    return await this.routeLocationService.findRouteLocationByRouteId(routeId);
  }

  @Patch('id/drag_and_drop')
  dragAndDrop(@Body() dto: DragAndDropDto[], @Param('id') id: number) {
    return this.routeLocationService.updateRouteLocations(id, dto);
  }
}
