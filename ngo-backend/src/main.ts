import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { JwtAuthGuard } from './shared/helper/jwt.guard';

import { AppModule } from './app.module';

async function bootstrap(): Promise<any> {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);

  const port = process.env.PORT || 3003;

  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  //swagger setup
  const options = new DocumentBuilder()
    .setTitle('Support Our Heroes')
    .setDescription('Support Our Heroes Fundraising and Donation Feature Api Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
}

bootstrap();
