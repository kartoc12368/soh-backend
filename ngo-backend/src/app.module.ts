import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { DonationModule } from './modules/donation/donation.module';
import { FundraiserPageModule } from './modules/fundraiser-page/fundraiser-page.module';
import { FundraiserModule } from './modules/fundraiser/fundraiser.module';
import { PaymentModule } from './modules/payment/payment.module';
import { MailerModule } from './shared/utility/mailer/mailer.module';

import { TypeOrmConfigService } from './config/typeorm.config.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.local.env' }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    AuthModule,
    MailerModule,
    FundraiserModule,
    DonationModule,
    AdminModule,
    FundraiserPageModule,
    PaymentModule,
  ],
})
export class AppModule { }
