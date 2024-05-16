import { forwardRef, Module } from '@nestjs/common';

import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

import { DonationModule } from '../donation/donation.module';

import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [forwardRef(() => DonationModule), HttpModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
