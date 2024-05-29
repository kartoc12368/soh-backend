import { Body, Controller, Param, ParseUUIDPipe, Post, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/shared/decorators/public.decorator';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';

import { DonationService } from './donation.service';
import { DonateDto } from './dto/donate.dto';

@ApiTags('Donation')
@Controller()
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  @Post('/donate')
  @ApiOperation({ summary: 'Donate Generally to NGO' })
  @Public()
  async donate(@Body(ValidationPipe) body: DonateDto): Promise<ResponseStructure> {
    return await this.donationService.donate(body);
  }

  @Post('/fundraiser-page/donate/:id')
  @ApiOperation({ summary: 'Donate Specifically to Fundraiser' })
  @Public()
  async donateToFundRaiser(@Body(ValidationPipe) body: DonateDto, @Param('id', ParseUUIDPipe) id: string): Promise<ResponseStructure> {
    return await this.donationService.donate(body, id);
  }
}
