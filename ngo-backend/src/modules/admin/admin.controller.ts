import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import { RoleGuard } from 'src/shared/helper/role.guard';
import { Constants } from 'src/shared/utility/constants';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UpdateFundraiserPageDto } from '../fundraiser-page/dto/update-fundraiser-page.dto';
import { FundraiserPageService } from '../fundraiser-page/fundraiser-page.service';
import { FundraiserService } from '../fundraiser/fundraiser.service';
import { AdminService } from './admin.service';
import { CreateFundraiserPageAdminDto } from './dto/create-fundraiserpage-admin.dto';
import { GeneratePasswordDto } from './dto/generate-password.dto';
import { AddOfflineDonationDto } from './dto/offline-donation.dto';

//storage path for fundraiserPage Images
export const storage = {
  storage: diskStorage({
    destination: './uploads/fundraiserPageImages',
    filename: (req, file, cb) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};

@Controller('admin')
@UseGuards(new RoleGuard(Constants.ROLES.ADMIN_ROLE))
@ApiTags('Admin')
@ApiSecurity('JWT-auth')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private fundraiserService: FundraiserService,
    private fundraiserPageService: FundraiserPageService,
    private dataSource: DataSource,
    // private fundraiserRepository: FundRaiserRepository,
    // private fundraiserPageRepository: FundraiserPageRepository,
    // private donationRepository: DonationRepository,
  ) { }

  //get totaldonations amount
  @Get('/totaldonations')
  async getTotalDonations() {
    return await this.adminService.getTotalDonations();
  }

  //get total fundraiser count
  @Get('/totalfundraiser')
  async getTotalFundraisers() {
    return await this.adminService.getTotalFundraisers();
  }

  //get total fundraiser count who is active
  @Get('/activefundraisers')
  async getActiveFundraisers() {
    return await this.adminService.getActiveFundraisers();
  }

  //get donations total of that day
  @Get('/todayDonations')
  async getTodayDonations() {
    return await this.adminService.getTodayDonations();
  }

  //get total donation amount of that month
  @Get('/monthlyDonations')
  async getThisMonthDonations() {
    return await this.adminService.getThisMonthDonations();
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
  async generatePasswordByEmail(@Body(ValidationPipe) body: GeneratePasswordDto,) {
    return await this.adminService.generatePasswordByEmail(body);
  }

  //adding Offline donation entry
  @Post('/addOfflineDonation')
  async addOfflineDonation(@Req() req, @Body() body: AddOfflineDonationDto) {
    return await this.adminService.addOfflineDonation(body);
  }

  //create fundraiser Page from admin side
  @ApiSecurity('JWT-auth')
  @UseGuards(new RoleGuard(Constants.ROLES.ADMIN_ROLE))
  @Post('/createPage')
  async createPage(@Req() req, @Body() body: CreateFundraiserPageAdminDto) {
    return await this.adminService.createFundraiserPageByEmail(body)
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
  @ApiSecurity('JWT-auth')
  @UseGuards(new RoleGuard(Constants.ROLES.ADMIN_ROLE))
  @Put('fundraiserPage/:id/updatePage')
  async updatePage(@Body() body: UpdateFundraiserPageDto, @Param('id', ParseUUIDPipe) id: string,) {
    return await this.fundraiserPageService.update(body, id);
  }
}
