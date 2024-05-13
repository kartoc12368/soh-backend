import { Body, Controller, Get, Param, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { ChangePasswordDto } from './dto/change-password.dto';
import { FindDonationsDto } from './dto/find-donation.dto';
import { UpdateFundraiserDto } from './dto/update-profile.dto';

import { Public } from 'src/shared/decorators/public.decorator';
import { RoleGuard } from 'src/shared/helper/role.guard';
import { Constants } from 'src/shared/utility/constants';
import { storageForProfileImages } from 'src/shared/utility/storage.utility';

import { FundraiserService } from './fundraiser.service';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';

@Controller('fundRaiser')
@ApiTags('FundRaiser')
@ApiSecurity('JWT-auth')
export class FundraiserController {
  constructor(private readonly fundraiserService: FundraiserService) {}

  @Post('/changePassword')
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  @ApiOperation({ summary: 'change Password Fundraiser using old password' })
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto): Promise<ResponseStructure> {
    return await this.fundraiserService.changePassword(req?.user, changePasswordDto);
  }

  @Get()
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  @ApiOperation({ summary: 'Get Logged In Fundraiser Data' })
  async getFundraiser(@Req() req): Promise<ResponseStructure> {
    return await this.fundraiserService.getLoggedInFundraiser(req?.user);
  }

  @Put('/update')
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  @ApiOperation({ summary: 'Update Fundraiser Profile' })
  async updateFundraiser(@Req() req, @Body(ValidationPipe) body: UpdateFundraiserDto): Promise<ResponseStructure> {
    this.fundraiserService.updateFundRaiserById(req?.user, body);
    return { message: 'Successfully updated' };
  }

  @Get('/fundraiser-page')
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  @ApiOperation({ summary: 'Get Fundraiser-page of current Fundraiser' })
  async getAllFundraiserPages(@Req() req): Promise<ResponseStructure> {
    return this.fundraiserService.getFundraiserPage(req?.user);
  }

  @Get('/fundraiser-page/:image')
  @Public()
  @ApiOperation({ summary: 'Fetch Fundraiser Page Images' })
  async getFundraiserPageImage(@Param() body, @Res() res): Promise<ResponseStructure> {
    return await this.fundraiserService.findFundraiserPageImage(res, body?.image);
  }

  @Post('upload')
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  @UseInterceptors(FileInterceptor('file', storageForProfileImages))
  @ApiOperation({ summary: 'Upload Profile Image' })
  async uploadProfileImage(@UploadedFile() file, @Req() req): Promise<ResponseStructure> {
    return await this.fundraiserService.uploadProfileImage(req.user, file);
  }

  @Get('profile-image/:imagename')
  @Public()
  @ApiOperation({ summary: 'Get Fundraiser Profile Image' })
  async findProfileImage(@Param('imagename') imagename, @Res() res): Promise<ResponseStructure> {
    return await this.fundraiserService.findProfileImage(res, imagename);
  }

  @Post('/createPage')
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  @ApiOperation({ summary: 'Create Fundraiser Page from Fundraiser side' })
  async createPage(@Req() req): Promise<ResponseStructure> {
    return await this.fundraiserService.createFundraiserPage(req?.user);
  }

  @Get('/donations')
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  @ApiOperation({ summary: 'Get All Donations specific to current fundraiser with filter' })
  async findAll(@Query() query: FindDonationsDto, @Req() req): Promise<ResponseStructure> {
    return await this.fundraiserService.getDonationFundraiser(query, req?.user);
  }

  @Get('/donations/download')
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  @ApiOperation({ summary: 'Download excel for donations history' })
  async downloadExcel(@Req() req, @Res() res): Promise<ResponseStructure> {
    return await this.fundraiserService.downloadExcelforDonations(req.user, res);
  }

  @Get('/getRaisedAmount')
  @ApiOperation({ summary: 'Get current fundraiser raised amount' })
  async getRaisedAmount(@Req() req): Promise<ResponseStructure> {
    return await this.fundraiserService.getRaisedAmount(req.user);
  }
}
