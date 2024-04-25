import { Body, Controller, Get, Param, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { ChangePasswordDto } from './dto/change-password.dto';
import { FindDonationsDto } from './dto/find-donation.dto';
import { UpdateFundraiserDto } from './dto/update-profile.dto';

import { Public } from 'src/shared/decorators/public.decorator';
import { RoleGuard } from 'src/shared/helper/role.guard';
import { Constants } from 'src/shared/utility/constants';
import { storageForProfileImages } from 'src/shared/utility/storage';

import { FundraiserService } from './fundraiser.service';


@Controller('fundRaiser')
@UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
@ApiTags('FundRaiser')
@ApiSecurity('JWT-auth')
export class FundraiserController {
  constructor(
    private readonly fundraiserService: FundraiserService,
  ) { }

  //change Password Fundraiser
  @Post('/changePassword')
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    await this.fundraiserService.changePassword(req, changePasswordDto);
    return 'Password Changed Successfully';
  }

  //get fundraiser details
  @Get()
  async getFundraiser(@Req() req) {
    return await this.fundraiserService.getLoggedInFundraiser(req.user);
  }

  //update fundraiser details
  @Put('/update')
  async updateFundraiser(@Req() req, @Body(ValidationPipe) body: UpdateFundraiserDto) {
    this.fundraiserService.updateFundRaiserById(req, body);
    return { message: 'Successfully updated' };
  }

  //get fundraiserPage By Login Fundraiser
  @Get('/fundraiser-page')
  async getAllFundraiserPages(@Req() req) {
    return this.fundraiserService.getFundraiserPage(req.user);
  }

  //upload fundraiser profileImage
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storageForProfileImages))
  async uploadProfileImage(@UploadedFile() file, @Req() req) {
    return await this.fundraiserService.uploadProfileImage(req.user, file);
  }

  //get fundraiser ProfileImage
  @Get('profile-image/:imagename')
  async findProfileImage(@Param('imagename') imagename, @Res() res) {
    return await this.fundraiserService.findProfileImage(res, imagename);
  }

  //create fundraiserPage from fundraiser dashboard
  @Post('/createPage')
  async createPage(@Req() req) {
    return await this.fundraiserService.createFundraiserPage(req.user);
  }

  //get all donations with filter
  @Get('/donations')
  async findAll(@Query() query: FindDonationsDto, @Req() req) {
    return await this.fundraiserService.findMany(query, req);
  }

  //download and save to local excel for donations data
  @Get('/donations/download')
  async downloadExcel(@Req() req, @Res() res) {
    await this.fundraiserService.downloadExcelforDonations(req.user, res);
  }

}
