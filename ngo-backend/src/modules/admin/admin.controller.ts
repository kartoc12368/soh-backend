import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { UpdateFundraiserPageDto } from '../fundraiser-page/dto/update-fundraiser-page.dto';
import { CreateFundraiserPageAdminDto } from './dto/create-fundraiserpage-admin.dto';
import { GeneratePasswordDto } from './dto/generate-password.dto';
import { AddOfflineDonationDto } from './dto/offline-donation.dto';

import { FundraiserPageService } from '../fundraiser-page/fundraiser-page.service';
import { AdminService } from './admin.service';

import { RoleGuard } from 'src/shared/helper/role.guard';

import { Response } from 'express';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { FindDonationsDto } from '../fundraiser/dto/find-donation.dto';
import { RoleEnum } from 'src/shared/enums/role.enum';

@Controller('admin')
@UseGuards(new RoleGuard(RoleEnum.ADMIN_ROLE))
@ApiTags('Admin')
@ApiSecurity('JWT-auth')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly fundraiserPageService: FundraiserPageService,
  ) {}

  @Get('/adminDashboard')
  @ApiOperation({ summary: 'Get Admin Dashboard Data' })
  async getAdminDashboardData(): Promise<ResponseStructure> {
    return await this.adminService.getAdminDashboardData();
  }

  @Get('/donations')
  @ApiOperation({ summary: 'Get Donations with filter' })
  async getDonationsAdmin(@Query() query: FindDonationsDto): Promise<ResponseStructure> {
    return await this.adminService.getDonationsAdmin(query);
  }

  @Put('/fundraiser/status/:id')
  @ApiOperation({ summary: 'Changing Fundraiser Status' })
  async changeFundraiserStatus(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseStructure> {
    return await this.adminService.changeFundraiserStatus(id);
  }

  @Delete('/fundraiser/delete/:id')
  @ApiOperation({ summary: 'Delete Fundraiser' })
  async deleteFundraiser(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseStructure> {
    return await this.adminService.deleteFundraiser(id);
  }

  @Get('/fundraiser')
  @ApiOperation({ summary: 'Get List of all existing fundraisers' })
  async getAllFundraiser(): Promise<ResponseStructure> {
    return await this.adminService.getAllFundraiser();
  }

  @Post('/generate')
  @ApiOperation({ summary: 'Generate Password for Fundraiser' })
  async generatePasswordByEmail(@Body(ValidationPipe) body: GeneratePasswordDto): Promise<ResponseStructure> {
    return await this.adminService.generatePasswordByEmail(body);
  }

  @Post('/addOfflineDonation')
  @ApiOperation({ summary: 'Add Offline Donation both general and to fundraiser' })
  async addOfflineDonation(@Body() body: AddOfflineDonationDto): Promise<ResponseStructure> {
    return await this.adminService.addOfflineDonation(body);
  }

  @Delete('/deletePage/:id')
  @ApiOperation({ summary: 'Delete Fundraiser Page' })
  async deleteFundraiserPage(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseStructure> {
    return await this.adminService.deleteFundraiserPage(id);
  }

  @Post('/createPage')
  @ApiOperation({ summary: 'Create Fundraiser Page from admin side' })
  async createPage(@Body() body: CreateFundraiserPageAdminDto): Promise<ResponseStructure> {
    return await this.adminService.createFundraiserPageByEmail(body);
  }

  @Get('/fundraiserPages')
  @ApiOperation({ summary: 'Get All Fundraiser Pages' })
  async getAllFundraiserPages(): Promise<ResponseStructure> {
    return await this.fundraiserPageService.getAllFundraiserPages();
  }

  @Put('fundraiserPage/updatePage/:id')
  @ApiOperation({ summary: 'Update Page Content of Fundraiser-Page' })
  async updatePage(@Body() body: UpdateFundraiserPageDto, @Param('id', ParseUUIDPipe) id: string): Promise<ResponseStructure> {
    return await this.fundraiserPageService.updateFundraiserPage(body, id);
  }

  @Get('/donations/download')
  @ApiOperation({ summary: 'Download Excel for all donations' })
  async downloadExcel(@Res() res: Response): Promise<any> {
    return await this.adminService.downloadExcelforDonations(res);
  }
}
