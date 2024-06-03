import { Module } from '@nestjs/common';
import { EasypayController } from './easypay.controller';
import { EasypayService } from './easypay.service';
import { DonationModule } from 'src/modules/donation/donation.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [DonationModule, MailerModule],
  controllers: [EasypayController],
  providers: [EasypayService],
  exports: [],
})
export class EasypayModule {}
