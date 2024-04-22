import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FundraiserPageModule } from '../fundraiser-page/fundraiser-page.module';
import { FundraiserModule } from '../fundraiser/fundraiser.module';

import { Donation } from 'src/shared/entity/donation.entity';
import { DonationController } from './donation.controller';
import { DonationRepository } from './donation.repository';
import { DonationService } from './donation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donation]),
    forwardRef(() => FundraiserModule),
    FundraiserPageModule,
  ],
  controllers: [DonationController],
  providers: [DonationService, DonationRepository],
  exports: [DonationRepository],
})
export class DonationModule { }
