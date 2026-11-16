import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { readConfig } from './config';

export function setupSwagger(app: INestApplication, env: NodeJS.ProcessEnv = process.env): void {
  if (!readConfig(env).swaggerEnabled) return;

  const options = new DocumentBuilder()
    .setTitle('DBI Skills Network API')
    .setDescription('Versioned API for DBI Skills Network identity, talent, and organization services.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    swaggerOptions: { persistAuthorization: false },
  });
}
