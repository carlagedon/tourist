import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CreateLocationDto } from './dto/create_location.dto';
import { VectorService } from 'src/ai/vector/vector.service';
import { toPgVectorString } from 'src/lib/utils/embedding_string';
import {
  Location,
  LocationInterface,
  RawLocationQueryResult,
  RawLocationRow,
} from 'src/lib/interface/location/location.interface';
import { UpdateLocationDto } from './dto/update_location.dto';
import { LocationTag } from '@prisma/client';

@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vector: VectorService,
  ) {}

  async createLocation(dto: CreateLocationDto) {
    const [lat, lng] = dto.coords;

    const tagsString = dto.tags ? dto.tags.join(', ') : '';
    const textToEmbed = `Название: ${dto.title}. Категория: ${dto.type}. Теги: ${tagsString}. Описание: ${dto.shortContext}`;

    const embedding = await this.vector.getEmbedding(textToEmbed);
    const stringVector = toPgVectorString(embedding);

    // Передаем tags в INSERT. Из RETURNING убираем алиасы 'as lat/lng' (сделаем маппинг в TS)
    const result = await this.prisma.$queryRaw<any[]>`
      INSERT INTO "Location" (
        "title", "type", "priceValue", "isFree", "tags",
        "shortContext", "loreContext", "coords", "embedding", 
        "updatedAt"
      )
      VALUES (
        ${dto.title},
        ${dto.type}::"LocationType",
        ${dto.priceValue ?? 0.0},
        ${dto.isFree ?? false},
        ${dto.tags ?? []}, 
        ${dto.shortContext},
        ${dto.loreContext},
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
        ${stringVector}::vector,
        NOW()
      )
      RETURNING id, title, type, "priceValue", "isFree", "tags", "shortContext", "loreContext", "createdAt", "updatedAt";
    `;

    const newLoc = result[0];
    return {
      ...newLoc,
      coords: [lat, lng],
    };
  }

  async getAllLocations(): Promise<LocationInterface[]> {
    const locations = await this.prisma.$queryRaw<RawLocationRow[]>`
    SELECT 
      id, 
      title, 
      type, 
      "priceValue", 
      "isFree", 
      "shortContext", 
      "loreContext", 
      tags,
      ST_Y(coords::geometry) as lat, 
      ST_X(coords::geometry) as lng
    FROM "Location"
    ORDER BY "createdAt" DESC;
  `;

    return locations.map((loc) => {
      let parsedTags: LocationTag[] = [];

      if (typeof loc.tags === 'string') {
        parsedTags = loc.tags
          .replace(/^{|}$/g, '')
          .split(',')
          .filter(Boolean) as LocationTag[];
      } else if (Array.isArray(loc.tags)) {
        parsedTags = loc.tags as LocationTag[];
      }

      return {
        id: loc.id,
        title: loc.title,
        type: loc.type,
        priceValue: loc.priceValue,
        isFree: loc.isFree,
        shortContext: loc.shortContext,
        loreContext: loc.loreContext,
        tags: parsedTags,
        lat: Number(loc.lat),
        lng: Number(loc.lng),
        createdAt: loc.createdAt || new Date(),
        updatedAt: loc.updatedAt || new Date(),
      };
    });
  }

  async getLocationById(id: number) {
    const locations = await this.prisma.$queryRaw<Location[]>`
    SELECT 
      id, 
      title, 
      type, 
      "priceValue", 
      "isFree", 
      "shortContext", 
      "loreContext", 
      ST_Y(coords::geometry) as lat, 
      ST_X(coords::geometry) as lng
    FROM "Location"
    WHERE id = ${id}
    LIMIT 1
  `;

    if (locations.length === 0) {
      return null;
    }

    const loc = locations[0];

    return {
      id: loc.id,
      title: loc.title,
      type: loc.type,
      priceValue: loc.priceValue,
      isFree: loc.isFree,
      shortContext: loc.shortContext,
      loreContext: loc.loreContext,
      coords: [loc.lat, loc.lng],
    };
  }

  async updateLocation(id: number, dto: UpdateLocationDto) {
    const existing = await this.getLocationById(id);
    if (!existing) {
      throw new NotFoundException('Локация не найдена');
    }

    let stringVector: string | null = null;
    let lat: number | null = null;
    let lng: number | null = null;

    if (dto.title || dto.type || dto.shortContext || dto.tags) {
      const title = dto.title ?? existing.title;
      const type = dto.type ?? existing.type;
      const shortContext = dto.shortContext ?? existing.shortContext;
      const tagsString = dto.tags ? dto.tags.join(', ') : '';

      const textToEmbed = `Название: ${title}. Категория: ${type}. Теги: ${tagsString}. Описание: ${shortContext}`;

      const embedding = await this.vector.getEmbedding(textToEmbed);
      stringVector = toPgVectorString(embedding);
    }

    if (dto.coords) {
      [lat, lng] = dto.coords;
    }

    await this.prisma.$executeRaw`
    UPDATE "Location"
      SET
    "title" = COALESCE(${dto.title}, "title"),
    "type" = COALESCE(${dto.type}::"LocationType", "type"),
    "priceValue" = COALESCE(${dto.priceValue}, "priceValue"),
    "isFree" = COALESCE(${dto.isFree}, "isFree"),
    "tags" = COALESCE(${dto.tags}, "tags"),
    "shortContext" = COALESCE(${dto.shortContext}, "shortContext"),
    "loreContext" = COALESCE(${dto.loreContext}, "loreContext"),
    
    "embedding" = CASE 
                    WHEN ${stringVector}::text IS NOT NULL 
                    THEN ${stringVector}::vector 
                    ELSE "embedding" 
                  END,
    
    "coords" = CASE 
                WHEN ${lat}::double precision IS NOT NULL AND ${lng}::double precision IS NOT NULL 
                THEN ST_SetSRID(ST_MakePoint(${lng}::double precision, ${lat}::double precision), 4326) 
                ELSE "coords" 
               END,
               
    "updatedAt" = NOW()
  WHERE id = ${id}
`;

    return this.getLocationById(id);
  }

  async deleteLocation(id: number) {
    return await this.prisma.location.delete({
      where: { id },
    });
  }

  async nearestLocation(
    vectorString: string,
    maxPrice: number,
    limit: number = 10,
  ): Promise<LocationInterface[]> {
    const rawLocations = await this.prisma.$queryRaw<RawLocationQueryResult[]>`
    SELECT 
      id, title, type, "priceValue", "isFree", "shortContext", "loreContext", tags,
      "createdAt", "updatedAt",
      ST_Y(coords::geometry) as lat, 
      ST_X(coords::geometry) as lng,
      (embedding <-> CAST(${vectorString} AS vector)) as distance
    FROM "Location"
    WHERE "priceValue" <= ${maxPrice}
    ORDER BY distance ASC
    LIMIT ${limit};
  `;

    return rawLocations.map((loc) => {
      let parsedTags: LocationTag[] = [];
      if (typeof loc.tags === 'string') {
        parsedTags = loc.tags
          .replace(/^{|}$/g, '')
          .split(',')
          .filter(Boolean) as LocationTag[];
      } else if (Array.isArray(loc.tags)) {
        parsedTags = loc.tags as LocationTag[];
      }

      return {
        id: loc.id,
        title: loc.title,
        type: loc.type,
        priceValue: loc.priceValue,
        isFree: loc.isFree,
        shortContext: loc.shortContext,
        loreContext: loc.loreContext,
        tags: parsedTags,
        lat: Number(loc.lat),
        lng: Number(loc.lng),
        createdAt: new Date(loc.createdAt),
        updatedAt: new Date(loc.updatedAt),
      };
    });
  }
}
