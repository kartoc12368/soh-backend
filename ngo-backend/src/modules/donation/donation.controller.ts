import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { DonationService } from './donation.service';
import { ApiTags } from '@nestjs/swagger';
import { DonateDto } from './dto/donate.dto';
import { Public } from 'src/shared/decorators/public.decorator';

@ApiTags('Donation')
@Controller()
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  //donate without fundraiser-page
  @Post('/donate')
  @Public()
  async donate(@Body(ValidationPipe) body: DonateDto) {
    await this.donationService.donate(body);
  }

  //donate with reference from fundraiser-page
  @Post('/fundraiser-page/:id/donate')
  @Public()
  async donateToFundRaiser(
    @Body(ValidationPipe) body: DonateDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    console.log(id);
    await this.donationService.donate(body, id);
  }
}
