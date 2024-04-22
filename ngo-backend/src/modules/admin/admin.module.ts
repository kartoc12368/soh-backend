import { Module, forwardRef } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MailerModule } from 'src/shared/utility/mailer/mailer.module';
import { FundraiserModule } from '../fundraiser/fundraiser.module';
import { DonationModule } from '../donation/donation.module';
import { FundraiserPageModule } from '../fundraiser-page/fundraiser-page.module';

@Module({
  imports: [
    forwardRef(() => FundraiserModule),
    MailerModule,
    DonationModule,
    FundraiserPageModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
