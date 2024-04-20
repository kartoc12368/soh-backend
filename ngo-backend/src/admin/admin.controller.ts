import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Req, UploadedFiles, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { sendEmailDto } from 'src/mailer/mail.interface';
import { MailerService } from 'src/mailer/mailer.service';
import { RoleGuard } from 'src/auth/guard/role.guard';
import { Constants } from 'src/utils/constants';
import { GeneratePasswordDto } from './dto/generate-password.dto';
import { FundraiserService } from 'src/fundraiser/fundraiser.service';
import { AddOfflineDonationDto } from './dto/offline-donation.dto';
import { FundRaiserRepository } from 'src/fundraiser/repo/fundraiser.repository';
import { FundraiserPageRepository } from 'src/fundraiser-page/repo/fundraiser-page.repository';
import { FundraiserPage } from 'src/fundraiser-page/entities/fundraiser-page.entity';
import { CreateFundraiserPageAdminDto } from './dto/create-fundraiserpage-admin.dto';
import { DonationRepository } from 'src/donation/repo/donation.repository';
import { diskStorage } from 'multer';
import {v4 as uuidv4} from "uuid";
import * as path from 'path';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateFundraiserPageDto } from 'src/fundraiser-page/dto/update-fundraiser-page.dto';
import { FundraiserPageService } from 'src/fundraiser-page/fundraiser-page.service';
import { DataSource } from 'typeorm';
import { Donation } from 'src/donation/entities/donation.entity';

//storage path for fundraiserPage Images
export const storage =   {  storage:diskStorage({
  destination:"./uploads/fundraiserPageImages",
  filename:(req,file,cb)=>{
    const filename:string = path.parse(file.originalname).name.replace(/\s/g, "") + uuidv4();
    const extension:string = path.parse(file.originalname).ext;

    cb(null, `${filename}${extension}`)
  } 
})
} 

@UseGuards(new RoleGuard(Constants.ROLES.ADMIN_ROLE))
@ApiTags("Admin")
@ApiSecurity("JWT-auth")
@Controller('admin')
export class AdminController {  
  constructor(private readonly adminService: AdminService,
    private mailerService:MailerService,
    private fundraiserRepository:FundRaiserRepository,
    private fundraiserService:FundraiserService,
    private fundraiserPageRepository:FundraiserPageRepository,
    private donationRepository:DonationRepository,
    private fundraiserPageService:FundraiserPageService,
    private dataSource: DataSource
    ) {}

  //get totaldonations amount  
  @Get("/totaldonations")
  async getTotalDonations(){
    return await this.adminService.getTotalDonationsService();
  }  

  //get total fundraiser count
  @Get("/totalfundraiser")
  async getTotalFundraisers(){
    return await this.fundraiserRepository.count();
  }

  //get total fundraiser count who is active
  @Get("/activefundraisers")
  async getActiveFundraisers(){
    return await this.fundraiserRepository.count({where:{status: "active"}});
  }

  //get donations total of that day
  @Get("/todayDonations")
  async getTodayDonations(){
    let todayDonations = 0;
const donations = await this.dataSource.getRepository(Donation)
    .createQueryBuilder("donation")
    .where("DATE(donation.created_at)=:date", {date: new Date()})
    .getMany()
    for (let index = 0; index < donations.length; index++) {
      const element = donations[index].amount;
      todayDonations = todayDonations + element;
      
    }
    return todayDonations;
    
  }

  //get total donation amount of that month
  @Get("/monthlyDonations")
  async getThisMonthDonations(){
    let thisMonthDonations = 0;
const usersBornToday = await this.dataSource.getRepository(Donation)
    .createQueryBuilder("donation")
    .where("date_part('month',donation.created_at)=:date", {date: new Date().getMonth()+1})
    .getMany()
    for (let index = 0; index < usersBornToday.length; index++) {
      const element = usersBornToday[index].amount;
      thisMonthDonations = thisMonthDonations + element;
      
    }
    return thisMonthDonations;
    
  }



  //change fundraiser status
  @Put("/fundraiser/status/:id")
  changeFundraiserStatus(@Param('id',ParseUUIDPipe) id: string) {
    return this.adminService.changeFundraiserStatus(id);
  }
  

 //delete fundraiser
  @Delete("/fundraiser/delete/:id")
  async deleteFundraiser(@Param('id',ParseUUIDPipe) id: string) {
    try{
    let user = await this.fundraiserRepository.findOne({where:{fundraiser_id:id}})
    if(user.role=="ADMIN"){
      throw new ForbiddenException("NOT ALLOWED")
    }
    return this.adminService.deleteFundraiser(id);
  }
  catch(error){
    throw new NotFoundException("Fundraiser Does not exist")
  }
  }

  //get all fundraiser
  @Get("/fundraiser")
  getAllFundraiser() {
    return this.adminService.getAllFundraiser();
  }

  //generate password for fundraiser
  @Post("/generate")
 async generatePasswordByEmail(@Body(ValidationPipe) body:GeneratePasswordDto){
  const isFundraiserExists = await this.fundraiserRepository.findOne({where:{email: body.email}})
  if(isFundraiserExists && isFundraiserExists.role == "FUNDRAISER"){
    throw new BadRequestException("Email already in use")
  }    
else{
      //generating random password in randomPassword variable
      var randomPassword = Math.random().toString(36).slice(-8);
      var body2 = {
          "firstName":body.firstName,
          "password":randomPassword
      }
      const dto:sendEmailDto = {
          // from: {name:"Lucy", address:"lucy@example.com"},
          recipients: [{name: body.firstName, address:body.email}],
          subject: "FundRaiser Password",
          html: "<p>Hi {firstName}, Login to Portal using:{password} </p><p><strong>Cheers!</strong></p>",
          placeholderReplacements:body2
        };
        await this.mailerService.sendMail(dto);
          
      return this.adminService.createdByAdmin(body, randomPassword)
}
  }

  //adding Offline donation entry
    @Post("/addOfflineDonation")
    async addOfflineDonation(@Req() req, @Body() body:AddOfflineDonationDto){
      if(await this.fundraiserRepository.findOne({where:{email:body.email}})){
        return await this.adminService.addOfflineDonation(body)
      }
      else{
        return "Fundraiser Not Found  "
      }

      
    }


    //create fundraiser Page from admin side
    @ApiSecurity("JWT-auth")
    @UseGuards(new RoleGuard(Constants.ROLES.ADMIN_ROLE))  
    @Post("/createPage")
    async createPage(@Req() req,@Body() body:CreateFundraiserPageAdminDto){
      try{
      let fundRaiser = await this.fundraiserService.findFundRaiserByEmail(body.email)
      let fundRaiserPage = await this.fundraiserPageRepository.findOne({where:{fundraiser:{fundraiser_id:fundRaiser.fundraiser_id}}})
      console.log(fundRaiserPage)
      if(fundRaiserPage==null){
      const fundraiserPage:FundraiserPage = new FundraiserPage();
      fundraiserPage.supporters = []
      fundraiserPage.gallery = []
      fundraiserPage.fundraiser = fundRaiser;
      await this.fundraiserPageRepository.save(fundraiserPage);
      return fundraiserPage;
      }
      else{
        return "Fundraiser Page already exists"
      }
    }
    catch(error){
      throw new NotFoundException("Fundraiser does not exist")
    }
    }
  

    //get all donations
    @Get("/donations")
    async getAllDonations(){
      return await this.donationRepository.find({relations:["fundraiser"]})
    }



    //get all fundraiserPages
    @Get("/fundraiserPages")
    async getAllFundraiserPages(){
      return await this.fundraiserPageRepository.find()
    }

    //update fundraiserPage from admin side
    @ApiSecurity("JWT-auth")
    @UseGuards(new RoleGuard(Constants.ROLES.ADMIN_ROLE))
    @Put("fundraiserPage/:id/updatePage")
    async updatePage(@Body() body:UpdateFundraiserPageDto,@Param("id",ParseUUIDPipe)id:string){
  return await this.fundraiserPageService.update(body,id)
    }
  }
