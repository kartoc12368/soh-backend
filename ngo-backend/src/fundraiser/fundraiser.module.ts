import { Module, forwardRef } from '@nestjs/common';
import { FundraiserService } from './fundraiser.service';
import { FundraiserController } from './fundraiser.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fundraiser } from './entities/fundraiser.entity';
import { FundRaiserRepository } from './repo/fundraiser.repository';
import { FundraiserPageModule } from 'src/fundraiser-page/fundraiser-page.module';
import { DonationModule } from 'src/donation/donation.module';

@Module({
  imports:[TypeOrmModule.forFeature([Fundraiser]),forwardRef(() =>FundraiserPageModule),forwardRef(() =>DonationModule)],
  controllers: [FundraiserController],
  providers: [FundraiserService,FundRaiserRepository],
  exports:[FundraiserService,FundRaiserRepository],
})
export class FundraiserModule {}
