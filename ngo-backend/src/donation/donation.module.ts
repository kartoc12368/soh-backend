import { Module, forwardRef } from '@nestjs/common';
import { DonationService } from './donation.service';
import { DonationController } from './donation.controller';
import { Donation } from './entities/donation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationRepository } from './repo/donation.repository';
import { FundraiserModule } from 'src/fundraiser/fundraiser.module';
import { FundraiserPageModule } from 'src/fundraiser-page/fundraiser-page.module';

@Module({
  imports:[TypeOrmModule.forFeature([Donation]),forwardRef(() =>FundraiserModule),FundraiserPageModule],
  controllers: [DonationController],
  providers: [DonationService,DonationRepository],
  exports:[DonationRepository]
})
export class DonationModule {}
