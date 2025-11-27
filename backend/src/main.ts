// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SeedService } from './seeds/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Plataforma de Vídeos Educativos')
    .setDescription('API Sprint 1 - Vídeos + Favoritos + S3')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);

  // ⬇️ Ejecutar seed sólo si estamos en desarrollo
  const env = configService.get('app.env');
  if (env === 'development') {
    const seedService = app.get(SeedService);
    await seedService.run();
  }

  const port = configService.get('app.port') || 3000;
  await app.listen(port);
}
bootstrap();
