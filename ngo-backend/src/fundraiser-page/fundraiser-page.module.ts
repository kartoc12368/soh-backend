import { Module, forwardRef } from '@nestjs/common';
import { FundraiserPageService } from './fundraiser-page.service';
import { FundraiserPageController } from './fundraiser-page.controller';
import { FundraiserModule } from 'src/fundraiser/fundraiser.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundraiserPageRepository } from './repo/fundraiser-page.repository';
import { FundraiserPage } from './entities/fundraiser-page.entity';

@Module({
  imports:[forwardRef(() =>FundraiserModule),TypeOrmModule.forFeature([FundraiserPage])],
  controllers: [FundraiserPageController],
  providers: [FundraiserPageService,FundraiserPageRepository],
  exports:[FundraiserPageRepository,FundraiserPageService]
})
export class FundraiserPageModule {}
