import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create_location.dto';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  createLocation(@Body() dto: CreateLocationDto) {
    return this.locationService.createLocation(dto);
  }

  @Get()
  getAllLocations() {
    return this.locationService.getAllLocations();
  }

  @Get(':id')
  getLocationById(@Param('id') id: string) {
    return this.locationService.getLocationById(parseInt(id, 10));
  }

  @Patch(':id')
  updateLocation(@Param('id') id: string, @Body() dto: CreateLocationDto) {
    return this.locationService.updateLocation(parseInt(id, 10), dto);
  }

  @Delete(':id')
  deleteLocation(@Param('id') id: string) {
    return this.locationService.deleteLocation(parseInt(id, 10));
  }
}
