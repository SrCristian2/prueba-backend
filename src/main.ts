import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import cors from '@fastify/cors';

async function bootstrap() {
  const adapterOptions = {
    logger: true,
  };

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(adapterOptions),
  );

  app.register(cors, {
    origin: '*',
    methods: ['GET', 'PUT', 'OPTIONS', 'POST', 'DELETE', 'PATCH'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const logger = new Logger('bootstrap');

  await app.listen(process.env.PORT || 3000);
  logger.log(
    `servidor corriendo por el puerto ${process.env.PORT} ${process.env.DB_HOST}`,
  );
}

bootstrap();
