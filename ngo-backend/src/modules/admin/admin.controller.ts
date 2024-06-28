import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { UpdateFundraiserPageDto } from '../fundraiser-page/dto/update-fundraiser-page.dto';
import { CreateFundraiserPageAdminDto } from './dto/create-fundraiserpage-admin.dto';
import { GeneratePasswordDto } from './dto/generate-password.dto';
import { AddOfflineDonationDto } from './dto/offline-donation.dto';
import { FindDonationsDto } from '../fundraiser/dto/find-donation.dto';

import { FundraiserPageService } from '../fundraiser-page/fundraiser-page.service';
import { AdminService } from './admin.service';

import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { RoleEnum } from 'src/shared/enums/role.enum';
import { RoleGuard } from 'src/shared/helper/role.guard';

import { Response } from 'express';
import { Public } from 'src/shared/decorators/public.decorator';
import { DeleteMultipleDto } from '../donation/dto/delete-donation.dto';

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
  @ApiOperation({ summary: 'Get Admin Dashboard Data (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  getAdminDashboardData(): Promise<ResponseStructure> {
    return this.adminService.getAdminDashboardData();
  }

  @Get('/donations')
  @ApiOperation({ summary: 'Get Donations with filter (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  getDonationsAdmin(@Query() query: FindDonationsDto): Promise<ResponseStructure> {
    return this.adminService.getDonationsAdmin(query);
  }

  @Get('/donations/delete')
  @ApiOperation({ summary: 'Get Donations with filter (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  getDonationsAdminForDelete(@Query() query: FindDonationsDto): Promise<ResponseStructure> {
    return this.adminService.getDonationsAdminForDelete(query);
  }

  @Put('/fundraiser/status/:id')
  @ApiOperation({ summary: 'Changing Fundraiser Status (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  changeFundraiserStatus(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseStructure> {
    return this.adminService.changeFundraiserStatus(id);
  }

  @Delete('/fundraiser/delete/:id')
  @ApiOperation({ summary: 'Delete Fundraiser (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  deleteFundraiser(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseStructure> {
    return this.adminService.deleteFundraiser(id);
  }

  @Get('/fundraiser')
  @ApiOperation({ summary: 'Get List of all existing fundraisers (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  getAllFundraiser(): Promise<ResponseStructure> {
    return this.adminService.getAllFundraiser();
  }

  @Post('/generate')
  @ApiOperation({ summary: 'Generate Password for Fundraiser (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  generatePasswordByEmail(@Body(ValidationPipe) body: GeneratePasswordDto): Promise<ResponseStructure> {
    return this.adminService.generatePasswordByEmail(body);
  }

  @Post('/addOfflineDonation')
  @ApiOperation({ summary: 'Add Offline Donation both general and to fundraiser (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  addOfflineDonation(@Body() body: AddOfflineDonationDto): Promise<ResponseStructure> {
    return this.adminService.addOfflineDonation(body);
  }

  @Delete('/deletePage/:id')
  @ApiOperation({ summary: 'Delete Fundraiser Page (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  deleteFundraiserPage(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseStructure> {
    return this.adminService.deleteFundraiserPage(id);
  }

  @Post('/createPage')
  @ApiOperation({ summary: 'Create Fundraiser Page from admin side (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  createPage(@Body() body: CreateFundraiserPageAdminDto): Promise<ResponseStructure> {
    return this.adminService.createFundraiserPageByEmail(body);
  }

  @Get('/fundraiserPages')
  @ApiOperation({ summary: 'Get All Fundraiser Pages (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  getAllFundraiserPages(): Promise<ResponseStructure> {
    return this.fundraiserPageService.getAllFundraiserPages();
  }

  @Put('fundraiserPage/updatePage/:id')
  @ApiOperation({ summary: 'Update Page Content of Fundraiser-Page (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  updatePage(@Body() body: UpdateFundraiserPageDto, @Param('id', ParseUUIDPipe) id: string): Promise<ResponseStructure> {
    return this.fundraiserPageService.updateFundraiserPage(body, id);
  }

  @Delete('/delete')
  async deleteDonations(@Body() ids: DeleteMultipleDto) {
    await this.adminService.deleteDonations(ids);
  }
}
