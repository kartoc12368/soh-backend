import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DonationModule } from '../donation/donation.module';
import { FundraiserPageModule } from '../fundraiser-page/fundraiser-page.module';

import { Fundraiser } from 'src/shared/entity/fundraiser.entity';
import { FundraiserController } from './fundraiser.controller';
import { FundRaiserRepository } from './fundraiser.repository';
import { FundraiserService } from './fundraiser.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fundraiser]),
    forwardRef(() => FundraiserPageModule),
    forwardRef(() => DonationModule),
  ],
  controllers: [FundraiserController],
  providers: [FundraiserService, FundRaiserRepository],
  exports: [FundraiserService, FundRaiserRepository],
})
export class FundraiserModule { }
