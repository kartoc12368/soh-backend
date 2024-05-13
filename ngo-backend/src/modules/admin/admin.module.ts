import { Module, forwardRef } from '@nestjs/common';

import { DonationModule } from '../donation/donation.module';
import { FundraiserPageModule } from '../fundraiser-page/fundraiser-page.module';
import { FundraiserModule } from '../fundraiser/fundraiser.module';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [forwardRef(() => FundraiserModule), DonationModule, FundraiserPageModule, MailerModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
