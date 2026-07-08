import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateRouteLocationDto } from './dto/create_location.dto';
import { DragAndDropDto } from './dto/drag_and_drop.dto';

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
      },
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
      },
    });
  }

  async getAllRouteLocations() {
    return await this.prisma.routeLocation.findMany({
      include: {
        route: true,
        location: true,
      },
    });
  }

  async getRouteLocationById(routeId: number, locationId: number) {
    return await this.prisma.routeLocation.findUnique({
      where: {
        routeId_locationId: {
          routeId,
          locationId,
        },
      },
      include: {
        route: true,
        location: true,
      },
    });
  }

  async updateRouteLocation(
    routeId: number,
    locationId: number,
    dto: CreateRouteLocationDto,
  ) {
    return await this.prisma.routeLocation.update({
      where: {
        routeId_locationId: {
          routeId,
          locationId,
        },
      },
      data: {
        routeId: dto.routeId,
        locationId: dto.locationId,
        stepOrder: dto.stepOrder,
      },
      include: {
        location: true,
      },
    });
  }

  // Удалить одну остановку вручную и пересчитать стоимость
  async removeStop(routeId: number, locationId: number) {
    await this.prisma.routeLocation.deleteMany({
      where: { routeId, locationId },
    });

    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: { locations: { include: { location: true } } },
    });

    if(!route) {
      throw new NotFoundException(`Маршрут с id ${routeId} не найден`);
    }

    const totalCost = route.locations.reduce(
      (sum, rl) => sum + (rl.location.isFree ? 0 : rl.location.priceValue),
      0,
    );

    return this.prisma.route.update({
      where: { id: routeId },
      data: { totalCost },
      include: {
        locations: {
          include: { location: true },
          orderBy: { stepOrder: 'asc' },
        },
      },
    });
  }

  // Для Drag and Drop
  async updateRouteLocations(routeId: number, location: DragAndDropDto[]) {
    await this.prisma.$transaction(
      location.map((location) =>
        this.prisma.routeLocation.updateMany({
          where: { routeId, locationId: location.locationId },
          data: {
            stepOrder: location.stepOrder,
            ...(location.arrivalTime !== undefined && {
              arrivalTime: location.arrivalTime,
            }),
            ...(location.durationMinutes !== undefined && {
              durationMinutes: location.durationMinutes,
            }),
          },
        }),
      ),
    );

    return this.prisma.route.findUnique({
      where: { id: routeId },
      include: {
        locations: {
          include: { location: true },
          orderBy: { stepOrder: 'asc' },
        },
      },
    });
  }
}
