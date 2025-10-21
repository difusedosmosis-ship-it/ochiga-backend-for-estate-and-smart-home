// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger('Bootstrap');

  // ✅ Global API prefix
  app.setGlobalPrefix('api');

  // ✅ Enable CORS for frontend (GitHub Codespaces + local + production)
  app.enableCors({
    origin: [
      "https://ideal-system-wrjxv66vrwwphgwj6-3000.app.github.dev", // frontend (Codespaces)
      "http://localhost:3000", // local
      "*", // allow all origins in AWS for now — adjust later if needed
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  // ✅ Global validation rules
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Global error handler
  app.useGlobalFilters(new HttpExceptionFilter());

  // ✅ Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Ochiga Smart Home & Estate API')
    .setDescription('API documentation for Ochiga backend services')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description: 'Enter JWT token as: Bearer <your-token>',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ✅ Use AWS Elastic Beanstalk’s default port (8080)
  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');

  const url = await app.getUrl();
  logger.log(`🚀 Ochiga Backend running on: ${url}`);
  logger.log(`📖 Swagger Docs available at: ${url}/api`);
  logger.log(`✅ Health Check available at: ${url}/api/health`);
}

bootstrap();