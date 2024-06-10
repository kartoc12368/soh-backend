import { Body, Controller, Delete, Param, ParseUUIDPipe, Post, Put, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/shared/decorators/public.decorator';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';

import { DonationService } from './donation.service';
import { DonateDto } from './dto/donate.dto';

@ApiTags('Donation')
@Controller('donate')
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  //donate without fundraiser-page
  @Post()
  @ApiOperation({ summary: 'Donate Generally to NGO (roles: user)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  @Public()
  donate(@Body(ValidationPipe) body: DonateDto): Promise<ResponseStructure> {
    return this.donationService.donate(body);
  }

  //donate with reference from fundraiser-page
  @Post('/fundraiser-page/:id')
  @ApiOperation({ summary: 'Donate Specifically to Fundraiser (roles: user)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  @Public()
  donateToFundRaiser(@Body(ValidationPipe) body: DonateDto, @Param('id', ParseUUIDPipe) id: string): Promise<ResponseStructure> {
    return this.donationService.donate(body, id);
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Update Donation (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  updateDonation(@Param('id') id: ParseUUIDPipe, @Body() body: DonateDto) {
    this.donationService.updateDonation(id, body);
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Delete Donation (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  deleteDonation(@Param('id') id: ParseUUIDPipe) {
    this.donationService.deleteDonation(id);
  }
}
