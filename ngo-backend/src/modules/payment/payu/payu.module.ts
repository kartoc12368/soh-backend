import { forwardRef, Module } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';
import { DonationModule } from 'src/modules/donation/donation.module';
import { PayUService } from './payu.service';
import { PayUController } from './payu.controller';

@Module({
  imports: [forwardRef(() => DonationModule), HttpModule],
  controllers: [PayUController],
  providers: [PayUService],
  exports: [PayUService],
})
export class PayUModule {}
