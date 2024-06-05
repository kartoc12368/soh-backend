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
import { PayUModule } from './modules/payment/payu/payu.module';
import { RazorpayModule } from './modules/payment/razorpay/razorpay.module';
import { EasypayModule } from './modules/payment/easypay/easypay.module';

import { TypeOrmConfigService } from './config/typeorm.config.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.local' }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
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
    RazorpayModule,
    EasypayModule,
    ScheduleModule.forRoot(),
    PayUModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
