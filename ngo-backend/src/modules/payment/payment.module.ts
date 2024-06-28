import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';

import { DonationModule } from 'src/modules/donation/donation.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [DonationModule, MailerModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
