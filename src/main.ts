import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { logger, winstonConfig } from './common/logger/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle('Fintech System API')
    .setDescription('A robust and secure fintech solution for managing accounts and transactions with a focus on performance and scalability.')
    .setVersion(configService.get<string>('config.api.version', '1.0'))
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get<number>('config.port', 3000);
  await app.listen(port).then(() => {
    logger.info(`Fintech System API is running on: http://localhost:${port}`);
  });
}

bootstrap();

