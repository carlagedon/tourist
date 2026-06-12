import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create_route.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('route')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  createRoute(@Body() dto: CreateRouteDto) {
    return this.routeService.createRoute(dto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAllRoutes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 10;
    return this.routeService.getAllRoutes(p, l);
  }

  @Get(':id')
  getRouteById(@Param('id') id: string) {
    return this.routeService.getRouteById(parseInt(id, 10));
  }

  @Patch(':id')
  updateRoute(@Param('id') id: string, @Body() dto: CreateRouteDto) {
    return this.routeService.updateRoute(parseInt(id, 10), dto);
  }

  @Delete(':id')
  deleteRoute(@Param('id') id: string) {
    return this.routeService.deleteRoute(parseInt(id, 10));
  }
}
