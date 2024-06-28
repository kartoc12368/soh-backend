import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FundraiserPageController } from './fundraiser-page.controller';
import { FundraiserPageRepository } from './fundraiser-page.repository';
import { FundraiserPageService } from './fundraiser-page.service';

import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';
import { FundraiserModule } from '../fundraiser/fundraiser.module';
import { FundraiserCampaignImagesRepository } from './fundraiser-campaign-images.repository';
import { FundraiserCampaignImages } from 'src/shared/entity/fundraiser-campaign-images.entity';
import { DonationModule } from '../donation/donation.module';

@Module({
  imports: [forwardRef(() => FundraiserModule), TypeOrmModule.forFeature([FundraiserPage, FundraiserCampaignImages]), forwardRef(() => DonationModule)],
  controllers: [FundraiserPageController],
  providers: [FundraiserPageService, FundraiserPageRepository, FundraiserCampaignImagesRepository],
  exports: [FundraiserPageRepository, FundraiserPageService, FundraiserCampaignImagesRepository],
})
export class FundraiserPageModule {}
