import { Body, Controller, Get, Param, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { ChangePasswordDto } from './dto/change-password.dto';
import { FindDonationsDto } from './dto/find-donation.dto';
import { UpdateFundraiserDto } from './dto/update-profile.dto';

import { DonationRepository } from '../donation/donation.repository';
import { FundraiserPageRepository } from '../fundraiser-page/fundraiser-page.repository';
import { FundRaiserRepository } from './fundraiser.repository';


import { Public } from 'src/shared/decorators/public.decorator';
import { RoleGuard } from 'src/shared/helper/role.guard';
import { Constants } from 'src/shared/utility/constants';

import { FundraiserService } from './fundraiser.service';

import { diskStorage } from 'multer';

import { v4 as uuidv4 } from "uuid";

import * as path from 'path';

export const storage = {
  storage: diskStorage({
    destination: "./uploads/profileImages", filename: (req, file, cb) => {
      const filename: string = path.parse(file.originalname).name.replace(/\s/g, "") + uuidv4();
      const extension: string = path.parse(file.originalname).ext;
      cb(null, `${filename}${extension}`)
    }
  })
}

@ApiTags("FundRaiser")
@Controller('fundRaiser')
export class FundraiserController {
  constructor(private readonly fundraiserService: FundraiserService,
    private fundRaiserRepository: FundRaiserRepository,
    private fundraiserPageRepository: FundraiserPageRepository,
    private donationRepository: DonationRepository,
  ) { }

  //change Password Fundraiser
  @Post("/changePassword")
  @ApiSecurity("JWT-auth")
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    await this.fundraiserService.changePassword(req, changePasswordDto)
    return "Password Changed Successfully";
  }

  //get fundraiser details
  @Get()
  @ApiSecurity("JWT-auth")
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  async getFundraiser(@Req() req) {
    return await this.fundraiserService.getLoggedInFundraiser(req.user);
  }


  //update fundraiser details
  @Put("/update")
  @ApiSecurity("JWT-auth")
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  async updateFundraiser(@Req() req, @Body(ValidationPipe) body: UpdateFundraiserDto) {
    this.fundraiserService.updateFundRaiserById(req, body)
    return { "message": "Successfully updated" }
  }

  //get fundraiserPage By Login Fundraiser
  @Get("/fundraiser-page")
  @ApiSecurity("JWT-auth")
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  async getAllFundraiserPages(@Req() req) {
    return this.fundraiserService.getFundraiserPage(req.user);
  }

  //upload fundraiser profileImage
  @Post("upload")
  @ApiSecurity("JWT-auth")
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  @UseInterceptors(FileInterceptor("file", storage))
  async uploadProfileImage(@UploadedFile() file, @Req() req) {
    return await this.fundraiserService.uploadProfileImage(req.user, file);
  }

  //get fundraiser ProfileImage
  @Get("profile-image/:imagename")
  @ApiSecurity("JWT-auth")
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  async findProfileImage(@Param("imagename") imagename, @Res() res) {
    return await this.fundraiserService.findProfileImage(res, imagename)
  }

  //create fundraiserPage from fundraiser dashboard
  @Post("/createPage")
  @ApiSecurity("JWT-auth")
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  async createPage(@Req() req) {
    return await this.fundraiserService.createFundraiserPage(req.user);
  }

  //get all donations with filter
  @Get("/donations")
  @ApiSecurity("JWT-auth")
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE) || new RoleGuard(Constants.ROLES.ADMIN_ROLE))
  async findAll(@Query() query: FindDonationsDto, @Req() req) {
    return await this.fundraiserService.findMany(query, req)
  }

  //download and save to local excel for donations data
  @Get('/donations/download')
  @ApiSecurity("JWT-auth")
  @UseGuards(new RoleGuard(Constants.ROLES.FUNDRAISER_ROLE))
  async downloadExcel(@Req() req, @Res() res) {
    await this.fundraiserService.downloadExcelforDonations(req.user, res);
  }


  @Get("/fundraiser-page/:filename")
  @Public()
  async downloadReport(@Param("filename") filename, @Res() res) {
    await this.fundraiserService.downloadExcelReport(res, filename);
  }


}
