import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateRouteDto } from './dto/create_route.dto';
import { LocationInterface } from 'src/lib/interface/location/location.interface';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoute(dto: CreateRouteDto) {
    const route = await this.prisma.route.create({
      data: {
        ...dto,
        chats: {
          create: { title: 'Основной чат с ИИ' },
        },
      },
      include: { chats: true },
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

  async getAllRoutes(page = 1, limit = 10) {
    return this.prisma.route.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        locations: {
          include: { location: true },
          orderBy: { stepOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRouteById(id: number) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        locations: {
          include: { location: true },
          orderBy: { stepOrder: 'asc' },
        },
        chats: { include: { messages: { orderBy: { createdAt: 'asc' } } } },
      },
    });
    if (!route) throw new NotFoundException(`Маршрут ${id} не найден`);
    return route;
  }

  async deleteRoute(id: number) {
    const route = await this.prisma.route.delete({
      where: { id },
    });
    return route;
  }

  async saveFromAgent(
    chatId: string,
    proposedPlaces: LocationInterface[],
    chatTitle: string,
    startCity: string,
    totalCost: number
  ) {
    if (proposedPlaces.length === 0) {
      console.log('[RouteService] Нет мест для сохранения');
      return null;
    }

    const chat = await this.prisma.chatSession.findUnique({
      where: { id: chatId },
      select: { routeId: true },
    });

    let routeId = chat?.routeId;

    // Первый раз — создаём Route и привязываем к чату
    if (!routeId) {
      const route = await this.prisma.route.create({
        data: {
          title: chatTitle || 'Новый маршрут',
          totalCost,
          status: 'DRAFT',
          startCity,
        },
      });
      routeId = route.id;
      await this.prisma.chatSession.update({
        where: {id: chatId},
        data: { routeId, ...(chatTitle && { title: chatTitle }) },
      });
      console.log(`[RouteService] Создан Route id=${routeId}`);
    } else {
      // Уже есть — обновляем стоимость
      await this.prisma.route.update({
        where: {
          id: routeId,
        },
        data: {
          totalCost,
        },
      });
    }

    (await this.prisma.routeLocation.deleteMany({
      where: {
        routeId,
      },
    }),
      await this.prisma.routeLocation.createMany({
        data: proposedPlaces.map((place, index) => ({
          routeId: routeId!,
          locationId: place.id,
          stepOrder: index,
        })),
      }));
    console.log(`[RouteService] Сохранено ${proposedPlaces.length} мест`);

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
