import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { sendEmailDto } from 'src/shared/utility/mailer/mail.interface';
import { MailerService } from 'src/shared/utility/mailer/mailer.service';
import { Constants } from 'src/utils/constants';
import { GeneratePasswordDto } from './dto/generate-password.dto';
import { AddOfflineDonationDto } from './dto/offline-donation.dto';
import { CreateFundraiserPageAdminDto } from './dto/create-fundraiserpage-admin.dto';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { RoleGuard } from 'src/shared/helper/role.guard';
import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { FundraiserService } from '../fundraiser/fundraiser.service';
import { FundraiserPageRepository } from '../fundraiser-page/fundraiser-page.repository';
import { DonationRepository } from '../donation/donation.repository';
import { FundraiserPageService } from '../fundraiser-page/fundraiser-page.service';
import { UpdateFundraiserPageDto } from '../fundraiser-page/dto/update-fundraiser-page.dto';
import { Donation } from 'src/shared/entity/donation.entity';
import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';

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
    private mailerService: MailerService,
    private fundraiserService: FundraiserService,
    private fundraiserPageService: FundraiserPageService,
    private dataSource: DataSource,
    // private fundraiserRepository: FundRaiserRepository,
    // private fundraiserPageRepository: FundraiserPageRepository,
    // private donationRepository: DonationRepository,
  ) {}

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
  async generatePasswordByEmail(
    @Body(ValidationPipe) body: GeneratePasswordDto,
  ) {
    const isFundraiserExists = await this.fundraiserRepository.findOne({
      where: { email: body.email },
    });
    if (isFundraiserExists && isFundraiserExists.role == 'FUNDRAISER') {
      throw new BadRequestException('Email already in use');
    } else {
      //generating random password in randomPassword variable
      var randomPassword = Math.random().toString(36).slice(-8);
      var body2 = {
        firstName: body.firstName,
        password: randomPassword,
      };
      const dto: sendEmailDto = {
        // from: {name:"Lucy", address:"lucy@example.com"},
        recipients: [{ name: body.firstName, address: body.email }],
        subject: 'FundRaiser Password',
        html: '<p>Hi {firstName}, Login to Portal using:{password} </p><p><strong>Cheers!</strong></p>',
        placeholderReplacements: body2,
      };
      await this.mailerService.sendMail(dto);

      return this.adminService.createdByAdmin(body, randomPassword);
    }
  }

  //adding Offline donation entry
  @Post('/addOfflineDonation')
  async addOfflineDonation(@Req() req, @Body() body: AddOfflineDonationDto) {
    if (
      await this.fundraiserRepository.findOne({ where: { email: body.email } })
    ) {
      return await this.adminService.addOfflineDonation(body);
    } else {
      return 'Fundraiser Not Found  ';
    }
  }

  //create fundraiser Page from admin side
  @ApiSecurity('JWT-auth')
  @UseGuards(new RoleGuard(Constants.ROLES.ADMIN_ROLE))
  @Post('/createPage')
  async createPage(@Req() req, @Body() body: CreateFundraiserPageAdminDto) {
    try {
      let fundRaiser = await this.fundraiserService.findFundRaiserByEmail(
        body.email,
      );
      let fundRaiserPage = await this.fundraiserPageRepository.findOne({
        where: { fundraiser: { fundraiser_id: fundRaiser.fundraiser_id } },
      });
      console.log(fundRaiserPage);
      if (fundRaiserPage == null) {
        const fundraiserPage: FundraiserPage = new FundraiserPage();
        fundraiserPage.supporters = [];
        fundraiserPage.gallery = [];
        fundraiserPage.fundraiser = fundRaiser;
        await this.fundraiserPageRepository.save(fundraiserPage);
        return fundraiserPage;
      } else {
        return 'Fundraiser Page already exists';
      }
    } catch (error) {
      throw new NotFoundException('Fundraiser does not exist');
    }
  }

  //get all donations
  @Get('/donations')
  async getAllDonations() {
    return await this.donationRepository.find({ relations: ['fundraiser'] });
  }

  //get all fundraiserPages
  @Get('/fundraiserPages')
  async getAllFundraiserPages() {
    return await this.fundraiserPageRepository.find();
  }

  //update fundraiserPage from admin side
  @ApiSecurity('JWT-auth')
  @UseGuards(new RoleGuard(Constants.ROLES.ADMIN_ROLE))
  @Put('fundraiserPage/:id/updatePage')
  async updatePage(
    @Body() body: UpdateFundraiserPageDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.fundraiserPageService.update(body, id);
  }
}
