import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { MetricsService } from './observability/metrics.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const metrics = app.get(MetricsService);

  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v1');

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN', '*'),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use((req, res, next) => {
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ??
      crypto.randomUUID();

    res.setHeader('x-request-id', requestId);
    const started = process.hrtime.bigint();

    res.on('finish', () => {
      const durationMs =
        Number(process.hrtime.bigint() - started) / 1_000_000;

      metrics.observeHttpRequest(
        req.method,
        req.route?.path ?? req.path,
        res.statusCode,
        durationMs,
      );
    });

    next();
  });

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`API listening on http://localhost:${port}`);
}

bootstrap();
