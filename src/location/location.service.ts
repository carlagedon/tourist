import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateLocationDto } from './dto/create_location.dto';
import { VectorService } from 'src/ai/vector/vector.service';
import { toPgVectorString } from 'src/utils/embedding_string';
import { log } from 'console';

@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vector: VectorService,
  ) {}

  async createLocation(dto: CreateLocationDto) {
    const [lat, lng] = dto.coords;

    const embedding = await this.vector.getEmbedding(dto.historyContext);
    const stringVector = toPgVectorString(embedding);
    

    return await this.prisma.$executeRaw`
      INSERT INTO "Location" (title, type, "historyContext", coords, embedding)
      VALUES (
        ${dto.title},
        ${dto.type}::"LocationType",
        ${dto.historyContext},
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
        ${stringVector}::vector
      )
    `;
  }

  async getAllLocations() {
    const locations = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, type, "historyContext", ST_Y(coords::geometry) as lat, ST_X(coords::geometry) as lng
      FROM "Location"
    `;
    return locations.map(loc => ({
      id: loc.id,
      title: loc.title,
      type: loc.type,
      historyContext: loc.historyContext,
      coords: [loc.lat, loc.lng],
    }));
  }

  async getLocationById(id: number) {
    const locations = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, type, "historyContext", ST_Y(coords::geometry) as lat, ST_X(coords::geometry) as lng
      FROM "Location"
      WHERE id = ${id}
    `;
    if (!locations.length) return null;
    const loc = locations[0];
    return {
      id: loc.id,
      title: loc.title,
      type: loc.type,
      historyContext: loc.historyContext,
      coords: [loc.lat, loc.lng],
    };
  }

  async updateLocation(id: number, dto: CreateLocationDto) {
    const [lat, lng] = dto.coords;

    const embedding = await this.vector.getEmbedding(dto.historyContext);
    const stringVector = toPgVectorString(embedding);

    await this.prisma.$executeRaw`
      UPDATE "Location"
      SET
        title = ${dto.title},
        type = ${dto.type}::"LocationType",
        "historyContext" = ${dto.historyContext},
        coords = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
        embedding = ${stringVector}::vector
      WHERE id = ${id}
    `;

    return this.getLocationById(id);
  }

  async deleteLocation(id: number) {
    return await this.prisma.location.delete({
      where: { id },
    });
  }
}
