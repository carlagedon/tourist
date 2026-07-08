import { Injectable, Logger } from '@nestjs/common';
import { LocationTag, LocationType } from '@prisma/client';
import { VectorService } from 'src/ai/vector/vector.service';
import { PrismaService } from 'src/db/prisma.service';
import { toPgVectorString } from 'src/lib/utils/embedding_string';

@Injectable()
export class SeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vector: VectorService,
  ) {}

  private readonly logger = new Logger(SeedService.name);

  async runSeed() {
    this.logger.log('Создание тестовых локаций');

    const seedLocations = [
      {
        title: 'Скала Жумбактас',
        type: LocationType.SIGHTSEEING,
        priceValue: 0,
        isFree: true,
        tags: [LocationTag.NATURE, LocationTag.ACTIVE, LocationTag.LAKE],
        shortContext: 'Знаменитая скала-загадка в центре залива.',
        loreContext:
          'По легенде, это застывшая девушка. Отличное место для бесплатных романтичных фото.',
        lat: 53.0783,
        lng: 70.2111,
      },
      {
        title: 'Остров Жумбактас',
        type: LocationType.SIGHTSEEING,
        priceValue: 100,
        isFree: false,
        tags: [LocationTag.NATURE, LocationTag.FAMILY, LocationTag.LAKE],
        shortContext: 'Живописный остров с видами на озеро Боровое.',
        loreContext:
          'Добраться можно на лодке или катамаране. Символ курорта, обязательное место для фото.',
        lat: 53.087434,
        lng: 70.252066,
      },
      {
        title: 'Ресторан "Aina"',
        type: LocationType.FOOD,
        priceValue: 40000,
        isFree: false,
        tags: [LocationTag.LUXURY, LocationTag.MEAT],
        shortContext: 'Премиум ресторан с видом на озеро.',
        loreContext:
          'Идеальное место для дорогих свиданий, подают шикарные стейки.',
        lat: 53.0855,
        lng: 70.25,
      },
      {
        title: 'Кафе "Лесное"',
        type: LocationType.FOOD,
        priceValue: 8000,
        isFree: false,
        tags: [LocationTag.CHEAP, LocationTag.MEAT, LocationTag.FAMILY],
        shortContext: 'Уютное кафе с домашней кухней.',
        loreContext:
          'Здесь делают отличные недорогие шашлыки, часто приходят с детьми.',
        lat: 53.091,
        lng: 70.26,
      },
      {
        title: 'Прокат квадроциклов "Экстрим"',
        type: LocationType.ACTIVITY,
        priceValue: 15000,
        isFree: false,
        tags: [LocationTag.ACTIVE, LocationTag.FAMILY],
        shortContext: 'Экстремальные поездки по лесу.',
        loreContext:
          'Выдают экипировку и проводят по лесным трассам разной сложности.',
        lat: 53.0888,
        lng: 70.24,
      },
      {
        title: 'Гора Кокше',
        type: LocationType.SIGHTSEEING,
        priceValue: 0,
        isFree: true,
        tags: [LocationTag.NATURE, LocationTag.ACTIVE, LocationTag.HISTORY],
        shortContext: 'Главная вершина Бурабайского национального парка.',
        loreContext:
          'Высота 947 метров. Подъём занимает около 3 часов, сверху открывается панорама на все озёра.',
        lat: 53.0612,
        lng: 70.2789,
      },
      {
        title: 'Озеро Боровое',
        type: LocationType.SIGHTSEEING,
        priceValue: 0,
        isFree: true,
        tags: [LocationTag.NATURE, LocationTag.LAKE, LocationTag.FAMILY],
        shortContext: 'Главное озеро курорта с чистой водой.',
        loreContext:
          'Казахская Швейцария. Летом можно купаться, арендовать катамараны и лодки.',
        lat: 53.0833,
        lng: 70.25,
      },
      {
        title: 'Прокат лодок и катамаранов',
        type: LocationType.ACTIVITY,
        priceValue: 3000,
        isFree: false,
        tags: [LocationTag.ACTIVE, LocationTag.FAMILY, LocationTag.LAKE],
        shortContext: 'Водные прогулки по озеру Боровое.',
        loreContext:
          'Аренда на час, можно доплыть до острова Жумбактас и скалы Окжетпес.',
        lat: 53.0841,
        lng: 70.248,
      },
      {
        title: 'Скала Окжетпес',
        type: LocationType.SIGHTSEEING,
        priceValue: 0,
        isFree: true,
        tags: [LocationTag.NATURE, LocationTag.HISTORY, LocationTag.ACTIVE],
        shortContext: 'Скала "Стрела не долетит" над озером.',
        loreContext:
          'Название связано с легендой о хане. Отвесная скала высотой 40 метров, популярна у скалолазов.',
        lat: 53.0798,
        lng: 70.2345,
      },
      {
        title: 'Санаторий "Бурабай"',
        type: LocationType.HOTEL,
        priceValue: 35000,
        isFree: false,
        tags: [LocationTag.LUXURY, LocationTag.FAMILY],
        shortContext: 'Главный санаторий курорта с бассейном и СПА.',
        loreContext:
          'Советская постройка с современным ремонтом. Лечебные процедуры, сосновый воздух, вид на озеро.',
        lat: 53.089,
        lng: 70.261,
      },
      {
        title: 'Конные прогулки "Степной ветер"',
        type: LocationType.ACTIVITY,
        priceValue: 5000,
        isFree: false,
        tags: [LocationTag.ACTIVE, LocationTag.NATURE, LocationTag.FAMILY],
        shortContext: 'Верховая езда по лесным тропам.',
        loreContext:
          'Маршруты от 1 до 3 часов. Подходит для новичков, инструктор сопровождает группу.',
        lat: 53.095,
        lng: 70.27,
      },
      {
        title: 'Музей природы Бурабай',
        type: LocationType.SIGHTSEEING,
        priceValue: 500,
        isFree: false,
        tags: [LocationTag.HISTORY, LocationTag.FAMILY],
        shortContext: 'Экспозиция флоры и фауны национального парка.',
        loreContext:
          'Чучела местных животных, гербарии, геологические образцы. Хорошо для детей.',
        lat: 53.087,
        lng: 70.265,
      },
      {
        title: 'Пляж "Голубой залив"',
        type: LocationType.ACTIVITY,
        priceValue: 0,
        isFree: true,
        tags: [
          LocationTag.NATURE,
          LocationTag.LAKE,
          LocationTag.FAMILY,
          LocationTag.ACTIVE,
        ],
        shortContext: 'Оборудованный пляж на берегу Борового.',
        loreContext:
          'Песчаный берег, кабинки для переодевания, спасатели в сезон. Самое популярное место для купания.',
        lat: 53.082,
        lng: 70.242,
      },
      {
        title: 'Кафе "Юрта"',
        type: LocationType.FOOD,
        priceValue: 12000,
        isFree: false,
        tags: [LocationTag.MEAT, LocationTag.HISTORY, LocationTag.FAMILY],
        shortContext: 'Казахская национальная кухня в юрте.',
        loreContext:
          'Бешбармак, куырдак, кумыс. Аутентичная обстановка, живая домбра по вечерам.',
        lat: 53.091,
        lng: 70.255,
      },
      {
        title: 'Верёвочный парк "Белка"',
        type: LocationType.ACTIVITY,
        priceValue: 4000,
        isFree: false,
        tags: [LocationTag.ACTIVE, LocationTag.FAMILY],
        shortContext: 'Верёвочный городок на деревьях в сосновом лесу.',
        loreContext:
          'Трассы разной сложности от детских до экстремальных. Всё снаряжение включено в стоимость.',
        lat: 53.0935,
        lng: 70.248,
      },
      {
        title: 'Смотровая площадка "Абылай"',
        type: LocationType.SIGHTSEEING,
        priceValue: 0,
        isFree: true,
        tags: [LocationTag.NATURE, LocationTag.HISTORY, LocationTag.ACTIVE],
        shortContext: 'Панорамная точка с видом на три озера.',
        loreContext:
          'Названа в честь хана Абылая. Подъём 20 минут пешком, открывается вид на Боровое, Большое и Малое Чебачье.',
        lat: 53.075,
        lng: 70.23,
      },
      {
        title: 'Гостевой дом "Сосны"',
        type: LocationType.HOTEL,
        priceValue: 12000,
        isFree: false,
        tags: [LocationTag.CHEAP, LocationTag.FAMILY],
        shortContext: 'Бюджетный уютный гостевой дом в сосновом бору.',
        loreContext:
          'Домашняя атмосфера, завтрак включён, до озера 10 минут пешком. Популярен у семей с детьми.',
        lat: 53.096,
        lng: 70.259,
      },
      {
        title: 'Зиплайн над озером',
        type: LocationType.ACTIVITY,
        priceValue: 7000,
        isFree: false,
        tags: [LocationTag.ACTIVE, LocationTag.LUXURY],
        shortContext: 'Скоростной спуск на тросе над водой.',
        loreContext:
          'Длина троса 300 метров, скорость до 80 км/ч. Один из самых длинных зиплайнов в Казахстане.',
        lat: 53.08,
        lng: 70.238,
      },
      {
        title: 'Ресторан "Сосновый бор"',
        type: LocationType.FOOD,
        priceValue: 20000,
        isFree: false,
        tags: [LocationTag.MEAT, LocationTag.LUXURY, LocationTag.FAMILY],
        shortContext: 'Ресторан среднего класса с террасой в лесу.',
        loreContext:
          'Большое меню: европейская и казахская кухня. Открытая терраса с видом на сосны, живая музыка в выходные.',
        lat: 53.0925,
        lng: 70.263,
      },
      {
        title: 'Озеро Большое Чебачье',
        type: LocationType.SIGHTSEEING,
        priceValue: 0,
        isFree: true,
        tags: [LocationTag.NATURE, LocationTag.LAKE, LocationTag.ACTIVE],
        shortContext: 'Второе по величине озеро национального парка.',
        loreContext:
          'Популярное место для рыбалки. Чище и тише Борового, меньше туристов, отличный клёв.',
        lat: 53.11,
        lng: 70.3,
      },
    ];

    for (const loc of seedLocations) {
      this.logger.log(`Векторизация локации: ${loc.title}...`);
      const textToEmbed = `Название: ${loc.title}. Категория: ${loc.type}. Теги: ${loc.tags}. Описание: ${loc.shortContext}`;
      const embedding = await this.vector.getEmbedding(textToEmbed);
      const stringVector = toPgVectorString(embedding);
      const tagsString = `{${loc.tags.join(',')}}`;

      await this.prisma.$executeRaw`
        INSERT INTO "Location" (
          title, type, "priceValue", "isFree", tags, "shortContext", "loreContext", coords, embedding, "createdAt", "updatedAt"
        ) VALUES (
          ${loc.title},
          CAST(${loc.type} AS "LocationType"),
          ${loc.priceValue},
          ${loc.isFree},
          CAST(${tagsString} AS "LocationTag"[]),
          ${loc.shortContext},
          ${loc.loreContext},
          ST_SetSRID(ST_MakePoint(${loc.lng}, ${loc.lat}), 4326),
          CAST(${stringVector} AS vector),
          NOW(),
          NOW()
        );
      `;
    }
  }
}
