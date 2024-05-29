import { forwardRef, Module } from '@nestjs/common';

import { DonationModule } from '../../donation/donation.module';

import { HttpModule } from '@nestjs/axios';
import { RazorpayController } from './razorpay.controller';
import { RazorpayService } from './razorpay.service';

@Module({
  imports: [forwardRef(() => DonationModule), HttpModule],
  controllers: [RazorpayController],
  providers: [RazorpayService],
  exports: [RazorpayService],
})
export class RazorpayModule {}
