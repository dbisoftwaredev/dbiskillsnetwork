import 'reflect-metadata';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import * as classTransformer from 'class-transformer';
import * as classValidator from 'class-validator';
import { AppModule } from './app.module';
import { readConfig } from './config';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const config = readConfig();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  app.setGlobalPrefix('api/v1', { exclude: [{ path: '/', method: RequestMethod.GET }] });
  setupSwagger(app);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    validatorPackage: classValidator,
    transformerPackage: classTransformer,
  }));
  app.enableShutdownHooks();
  await app.listen(config.port, config.host);
}
bootstrap().catch(() => { console.error('API startup failed. Check configuration and port 3001.'); process.exitCode = 1; });
