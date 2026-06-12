import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RouteLocationService } from './route-location.service';
import { CreateRouteLocationDto } from './dto/create_location.dto';

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
    @Param('routeId') routeId: string,
    @Param('locationId') locationId: string,
  ) {
    return await this.routeLocationService.getRouteLocationById(
      parseInt(routeId, 10),
      parseInt(locationId, 10),
    );
  }

  @Patch(':routeId/:locationId')
  async updateRouteLocation(
    @Param('routeId') routeId: string,
    @Param('locationId') locationId: string,
    @Body() dto: CreateRouteLocationDto,
  ) {
    return await this.routeLocationService.updateRouteLocation(
      parseInt(routeId, 10),
      parseInt(locationId, 10),
      dto,
    );
  }

  @Delete(':routeId/:locationId')
  async deleteRouteLocation(
    @Param('routeId') routeId: string,
    @Param('locationId') locationId: string,
  ) {
    return await this.routeLocationService.deleteRouteLocation(
      parseInt(routeId, 10),
      parseInt(locationId, 10),
    );
  }

  @Get(':routeId')
  async findRouteLocationByRouteId(@Param('routeId') routeId: string) {
    return await this.routeLocationService.findRouteLocationByRouteId(
      parseInt(routeId, 10),
    );
  }
}
