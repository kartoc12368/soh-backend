import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { DonationModule } from './modules/donation/donation.module';
import { FundraiserPageModule } from './modules/fundraiser-page/fundraiser-page.module';
import { FundraiserModule } from './modules/fundraiser/fundraiser.module';
import { PaymentModule } from './modules/payment/payment.module';
import { typeOrmAsyncConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `config/env/${process.env?.NODE_ENV}.yaml` }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        host: process.env?.MAIL_HOST,
        port: Number(process.env?.MAIL_PORT),
        secure: false,
        auth: {
          user: process.env?.MAIL_USER,
          pass: process.env?.MAIL_PASSWORD,
        },
      },
      defaults: { from: { name: process.env?.APP_NAME, address: process.env?.MAIL_USER } },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL),
        limit: Number(process.env.THROTTLE_LIMIT),
      },
    ]),
    AuthModule,
    FundraiserModule,
    DonationModule,
    AdminModule,
    FundraiserPageModule,
    PaymentModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
