import { Module, forwardRef } from '@nestjs/common';
import { FundraiserService } from './fundraiser.service';
import { FundraiserController } from './fundraiser.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';
import { FundraiserPageModule } from '../fundraiser-page/fundraiser-page.module';
import { DonationModule } from '../donation/donation.module';
import { FundRaiserRepository } from './fundraiser.repository';

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
export class FundraiserModule {}
