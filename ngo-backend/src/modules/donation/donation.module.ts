import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FundraiserPageModule } from '../fundraiser-page/fundraiser-page.module';
import { FundraiserModule } from '../fundraiser/fundraiser.module';

import { Donation } from 'src/shared/entity/donation.entity';
import { DonationController } from './donation.controller';
import { DonationRepository } from './donation.repository';
import { DonationService } from './donation.service';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [TypeOrmModule.forFeature([Donation]), forwardRef(() => FundraiserModule), FundraiserPageModule, PaymentModule],
  controllers: [DonationController],
  providers: [DonationService, DonationRepository],
  exports: [DonationRepository],
})
export class DonationModule { }
