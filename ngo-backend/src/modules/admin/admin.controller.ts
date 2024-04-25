import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

import { UpdateFundraiserPageDto } from '../fundraiser-page/dto/update-fundraiser-page.dto';
import { CreateFundraiserPageAdminDto } from './dto/create-fundraiserpage-admin.dto';
import { GeneratePasswordDto } from './dto/generate-password.dto';
import { AddOfflineDonationDto } from './dto/offline-donation.dto';

import { FundraiserPageService } from '../fundraiser-page/fundraiser-page.service';
import { AdminService } from './admin.service';

import { RoleGuard } from 'src/shared/helper/role.guard';
import { Constants } from 'src/shared/utility/constants';

import { FileInterceptor } from '@nestjs/platform-express';
import { FindDonationsDto } from '../fundraiser/dto/find-donation.dto';

import { storage2 } from 'src/shared/utility/storage';


@Controller('admin')
@UseGuards(new RoleGuard(Constants.ROLES.ADMIN_ROLE))
@ApiTags('Admin')
@ApiSecurity('JWT-auth')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private fundraiserPageService: FundraiserPageService,
  ) { }

  //get totaldonations amount
  @Get('/adminDashboard')
  async getAdminDashboardData() {
    return await this.adminService.getAdminDashboardData();
  }

  @Get('/donations')
  @UseGuards(new RoleGuard(Constants.ROLES.ADMIN_ROLE))
  async findAll(@Query() query: FindDonationsDto, @Req() req) {
    return await this.adminService.findMany(query, req);
  }

  @Post('/donation/uploadCertificate/:id')
  @UseInterceptors(FileInterceptor('file', storage2))
  async uploadCertificate(@UploadedFile() file, @Param('id', ParseUUIDPipe) id: string) {
    return await this.adminService.uploadCertificate(file, id);
  }

  @Get('donation/certificate/:imagename')
  @UseGuards(new RoleGuard(Constants.ROLES.ADMIN_ROLE))
  async findProfileImage(@Param('imagename') imagename, @Res() res) {
    return await this.adminService.findCerificate(res, imagename);
  }

  //change fundraiser status
  @Put('/fundraiser/status/:id')
  changeFundraiserStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.changeFundraiserStatus(id);
  }

  //delete fundraiser
  @Delete('/fundraiser/delete/:id')
  async deleteFundraiser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteFundraiser(id);
  }

  //get all fundraiser
  @Get('/fundraiser')
  getAllFundraiser() {
    return this.adminService.getAllFundraiser();
  }

  //generate password for fundraiser
  @Post('/generate')
  async generatePasswordByEmail(@Body(ValidationPipe) body: GeneratePasswordDto) {
    return await this.adminService.generatePasswordByEmail(body);
  }

  //adding Offline donation entry
  @Post('/addOfflineDonation')
  async addOfflineDonation(@Req() req, @Body() body: AddOfflineDonationDto) {
    return await this.adminService.addOfflineDonation(body);
  }

  @Delete('/deletePage/:id')
  async deleteFundraiserPage(@Param('id', ParseUUIDPipe) id: string) {
    return await this.adminService.deleteFundraiserPage(id);
  }

  //create fundraiser Page from admin side
  @Post('/createPage')
  async createPage(@Req() req, @Body() body: CreateFundraiserPageAdminDto) {
    return await this.adminService.createFundraiserPageByEmail(body);
  }

  //get all donations
  @Get('/donations')
  async getAllDonations() {
    return await this.adminService.getAllDonations();
  }

  //get all fundraiserPages
  @Get('/fundraiserPages')
  async getAllFundraiserPages() {
    return await this.adminService.getAllFundraiserPages();
  }

  //update fundraiserPage from admin side
  @Put('fundraiserPage/updatePage/:id')
  async updatePage(@Body() body: UpdateFundraiserPageDto, @Param('id', ParseUUIDPipe) id: string) {
    console.log(body);
    return await this.fundraiserPageService.update(body, id);
  }
}
