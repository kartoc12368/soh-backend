import { forwardRef, Module } from '@nestjs/common';

import { PaymentService } from './payment.service';

import { PaymentController } from './payment.controller';

import { DonationModule } from '../donation/donation.module';

@Module({
  imports: [forwardRef(() => DonationModule)],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentModule { }
