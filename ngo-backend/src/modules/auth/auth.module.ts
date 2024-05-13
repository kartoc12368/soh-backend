import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AdminModule } from '../admin/admin.module';
import { FundraiserModule } from '../fundraiser/fundraiser.module';

import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { ForgottenPasswordRepository } from './forgot-password.repository';
import { MailerModule } from '@nestjs-modules/mailer';
@Module({
  imports: [
    FundraiserModule,
    AdminModule,
    MailerModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRE') + 's',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [LocalStrategy, JwtStrategy, AuthService, ForgottenPasswordRepository],
})
export class AuthModule {}
