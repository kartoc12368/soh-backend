import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guard/jwt.guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
const cors = require('cors');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  // app.use(cookieParser());
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  const corsOpts = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],
    allowedHeaders: [
      // "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ]
  }
  app.use(cors(corsOpts))
  app.enableCors({
    origin: ["http://localhost:3000", "http://localhost:8080", "http://localhost:4200"]
  });

  const options = new DocumentBuilder()
    .setTitle('NGO Website')
    .setDescription('Ngo Website Api Documentation')
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
  await app.listen(3001);
}
bootstrap();
