import { Body, Controller, Param, ParseUUIDPipe, Post, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from 'src/shared/decorators/public.decorator';

import { DonationService } from './donation.service';

import { DonateDto } from './dto/donate.dto';

@ApiTags('Donation')
@Controller()
export class DonationController {
  constructor(private readonly donationService: DonationService) { }

  //donate without fundraiser-page
  @Post('/donate')
  @Public()
  async donate(@Body(ValidationPipe) body: DonateDto) {
    await this.donationService.donate(body);
  }

  //donate with reference from fundraiser-page
  @Post('/fundraiser-page/:id/donate')
  @Public()
  async donateToFundRaiser(@Body(ValidationPipe) body: DonateDto, @Param('id', ParseUUIDPipe) id: string) {
    await this.donationService.donate(body, id);
  }
}
