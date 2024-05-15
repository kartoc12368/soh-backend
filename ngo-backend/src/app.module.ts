import { Module } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';

import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { DonationModule } from './modules/donation/donation.module';
import { FundraiserPageModule } from './modules/fundraiser-page/fundraiser-page.module';
import { FundraiserModule } from './modules/fundraiser/fundraiser.module';
import { PaymentModule } from './modules/payment/payment.module';

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
      template: {
        dir: 'src/shared/email_templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    AuthModule,
    FundraiserModule,
    DonationModule,
    AdminModule,
    FundraiserPageModule,
    PaymentModule,
  ],
})
export class AppModule {}
