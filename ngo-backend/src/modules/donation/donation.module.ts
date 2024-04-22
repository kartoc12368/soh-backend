import { Module, forwardRef } from '@nestjs/common';
import { DonationService } from './donation.service';
import { DonationController } from './donation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donation } from 'src/shared/entity/donation.entity';
import { FundraiserModule } from '../fundraiser/fundraiser.module';
import { FundraiserPageModule } from '../fundraiser-page/fundraiser-page.module';
import { DonationRepository } from './donation.repository';

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
export class DonationModule {}
