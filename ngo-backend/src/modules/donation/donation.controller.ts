import { Body, Controller, Param, ParseUUIDPipe, Post, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/shared/decorators/public.decorator';

import { DonationService } from './donation.service';

import { DonateDto } from './dto/donate.dto';

@ApiTags('Donation')
@Controller()
export class DonationController {
  constructor(private readonly donationService: DonationService) { }

  //donate without fundraiser-page
  @Post('/donate')
  @ApiOperation({ summary: "Donate Generally to NGO" })
  @Public()
  async donate(@Body(ValidationPipe) body: DonateDto) {
    return await this.donationService.donate(body);
  }

  //donate with reference from fundraiser-page
  @Post('/fundraiser-page/:id/donate')
  @ApiOperation({ summary: "Donate Specifically to Fundraiser" })
  @Public()
  async donateToFundRaiser(@Body(ValidationPipe) body: DonateDto, @Param('id', ParseUUIDPipe) id: string) {
    return await this.donationService.donate(body, id);
  }
}
