import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

import { DonationModule } from 'src/modules/donation/donation.module';

import { EasypayController } from './easypay.controller';
import { EasypayService } from './easypay.service';

@Module({
  imports: [DonationModule, MailerModule],
  controllers: [EasypayController],
  providers: [EasypayService],
  exports: [EasypayService],
})
export class EasypayModule {}
