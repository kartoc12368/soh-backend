import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { DonationModule } from './modules/donation/donation.module';
import { FundraiserPageModule } from './modules/fundraiser-page/fundraiser-page.module';
import { FundraiserModule } from './modules/fundraiser/fundraiser.module';
import { MailerModule } from './shared/utility/mailer/mailer.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.local.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        url: 'postgres://ngo_test_user:o2ULIRQ3hRGtexDdvC1vEc8uYZL65zus@dpg-cobth4mn7f5s73fup8q0-a.oregon-postgres.render.com/ngo_test',
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DATABASE_SYNC'),
        logging: configService.get<boolean>('DATABASE_LOGGING'),
        database: configService.get('DATABASE_NAME'),
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    MailerModule,
    FundraiserModule,
    DonationModule,
    AdminModule,
    FundraiserPageModule,
    ScheduleModule.forRoot(),
    PaymentModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule { }
