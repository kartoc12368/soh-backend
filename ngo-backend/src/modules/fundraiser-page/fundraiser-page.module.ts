import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';
import { FundraiserModule } from '../fundraiser/fundraiser.module';
import { FundraiserPageController } from './fundraiser-page.controller';
import { FundraiserPageRepository } from './fundraiser-page.repository';
import { FundraiserPageService } from './fundraiser-page.service';

@Module({
  imports: [forwardRef(() => FundraiserModule), TypeOrmModule.forFeature([FundraiserPage])],
  controllers: [FundraiserPageController],
  providers: [FundraiserPageService, FundraiserPageRepository],
  exports: [FundraiserPageRepository, FundraiserPageService],
})
export class FundraiserPageModule { }
