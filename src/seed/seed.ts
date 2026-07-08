import { NestFactory } from '@nestjs/core';
import { SeedService } from './seed.service';
import { SeedModule } from './seed.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);

  // Достаем наш сервис из контейнера DI
  const seedService = app.get(SeedService);

  try {
    await seedService.runSeed();
  } catch (error) {
    console.error('Ошибка сидирования:', error);
  } finally {
    // Закрываем контекст и отключаемся от БД
    await app.close();
    process.exit(0);
  }
}

bootstrap();
