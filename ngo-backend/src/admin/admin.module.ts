import { Module, forwardRef } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { FundraiserModule } from 'src/fundraiser/fundraiser.module';
import { MailerModule } from 'src/mailer/mailer.module';
import { DonationModule } from 'src/donation/donation.module';
import { FundraiserPageModule } from 'src/fundraiser-page/fundraiser-page.module';

@Module({
  imports: [forwardRef(() =>FundraiserModule),MailerModule,DonationModule,FundraiserPageModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports:[AdminService]
})
export class AdminModule {}
