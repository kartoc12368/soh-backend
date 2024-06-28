import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import expressBasicAuth from 'express-basic-auth';
import helmet from 'helmet';

import { JwtAuthGuard } from './shared/helper/jwt.guard';

import { AppModule } from './app.module';

const SWAGGER_ENVS = ['local', 'dev', 'staging'];

async function bootstrap(): Promise<any> {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);

  const port = process.env.PORT || 3003;

  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
  app.enableCors({
    origin: ['https://donation.supportourheroes.in', 'http://localhost:3000'],
    methods: ['POST', 'PUT', 'DELETE', 'GET'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  //swagger setup

  if (SWAGGER_ENVS.includes(process.env.NODE_ENV)) {
    app.use(
      ['/api', '/api-json'],
      expressBasicAuth({
        challenge: true,
        users: {
          [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
        },
      }),
    );

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
  }
  await app.listen(port);
}

bootstrap();
