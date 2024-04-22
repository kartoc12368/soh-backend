import { Module, forwardRef } from '@nestjs/common';
import { FundraiserPageService } from './fundraiser-page.service';
import { FundraiserPageController } from './fundraiser-page.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundraiserModule } from '../fundraiser/fundraiser.module';
import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';
import { FundraiserPageRepository } from './fundraiser-page.repository';

@Module({
  imports: [
    forwardRef(() => FundraiserModule),
    TypeOrmModule.forFeature([FundraiserPage]),
  ],
  controllers: [FundraiserPageController],
  providers: [FundraiserPageService, FundraiserPageRepository],
  exports: [FundraiserPageRepository, FundraiserPageService],
})
export class FundraiserPageModule {}
