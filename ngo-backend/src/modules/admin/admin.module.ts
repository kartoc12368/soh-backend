import { Module, forwardRef } from '@nestjs/common';

import { MailerModule } from 'src/shared/utility/mailer/mailer.module';
import { DonationModule } from '../donation/donation.module';
import { FundraiserPageModule } from '../fundraiser-page/fundraiser-page.module';
import { FundraiserModule } from '../fundraiser/fundraiser.module';

import { AdminController } from './admin.controller';

import { AdminService } from './admin.service';

@Module({
  imports: [forwardRef(() => FundraiserModule), MailerModule, DonationModule, FundraiserPageModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule { }
