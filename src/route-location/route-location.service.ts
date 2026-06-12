import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateRouteLocationDto } from './dto/create_location.dto';

@Injectable()
export class RouteLocationService {
  constructor(private readonly prisma: PrismaService) {}

  async findRouteLocationByRouteId(routeId: number) {
    return await this.prisma.routeLocation.findMany({
      where: {
        routeId,
      },
      include: {
        location: true,
      },
      orderBy: {
        stepOrder: 'asc',
      }
    });
  }
  
  async createRouteLocation(dto: CreateRouteLocationDto) {
    return await this.prisma.routeLocation.create({
      data: {
        routeId: dto.routeId,
        locationId: dto.locationId,
        stepOrder: dto.stepOrder,
      },
      include: {
        location: true,
      }
    });
  }

  async getAllRouteLocations() {
    return await this.prisma.routeLocation.findMany({
      include: {
        route: true,
        location: true,
      }
    });
  }

  async getRouteLocationById(routeId: number, locationId: number) {
    return await this.prisma.routeLocation.findUnique({
      where: {
        routeId_locationId: {
          routeId,
          locationId,
        }
      },
      include: {
        route: true,
        location: true,
      }
    });
  }

  async updateRouteLocation(routeId: number, locationId: number, dto: CreateRouteLocationDto) {
    return await this.prisma.routeLocation.update({
      where: {
        routeId_locationId: {
          routeId,
          locationId,
        }
      },
      data: {
        routeId: dto.routeId,
        locationId: dto.locationId,
        stepOrder: dto.stepOrder,
      },
      include: {
        location: true,
      }
    });
  }

  async deleteRouteLocation(routeId: number, locationId: number) {
    return await this.prisma.routeLocation.delete({
      where: {
        routeId_locationId: {
          routeId,
          locationId,
        }
      }
    });
  }
}
