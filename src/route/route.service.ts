import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateRouteDto } from './dto/create_route.dto';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoute(dto: CreateRouteDto) {
    const route = await this.prisma.route.create({
      data: dto,
    });
    return route;
  }

  async updateRoute(id: number, dto: CreateRouteDto) {
    const route = await this.prisma.route.update({
      where: { id },
      data: dto,
    });
    return route;
  }

  async getAllRoutes(page: number = 1, limit: number = 10) {
    const routes = await this.prisma.route.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
    return routes;
  }

  async getRouteById(id: number) {
    const route = await this.prisma.route.findUnique({
      where: { id },
    });
    return route;
  }

  async deleteRoute(id: number) {
    const route = await this.prisma.route.delete({
      where: { id },
    });
    return route;
  }
}
