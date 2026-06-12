import { Module } from '@nestjs/common';
import { AiModule } from './ai/ai.module';
import { RouteModule } from './route/route.module';
import { LocationModule } from './location/location.module';
import { ConfigModule } from '@nestjs/config';
import { RouteLocationModule } from './route-location/route-location.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AiModule,
    RouteModule,
    LocationModule,
    RouteLocationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
