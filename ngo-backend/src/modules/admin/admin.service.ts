import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Donation } from 'src/shared/entity/donation.entity';
import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';
import { sendEmailDto } from 'src/shared/utility/mailer/mail.interface';
import { MailerService } from 'src/shared/utility/mailer/mailer.service';
import { Constants } from 'src/shared/utility/constants';
import { DataSource } from 'typeorm';
import { DonationRepository } from '../donation/donation.repository';
import { FundraiserPageRepository } from '../fundraiser-page/fundraiser-page.repository';
import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { FundraiserService } from '../fundraiser/fundraiser.service';

@Injectable()
export class AdminService {
  constructor(
    private fundraiserRepository: FundRaiserRepository,
    private donationRepository: DonationRepository,
    private fundraiserPageRepository: FundraiserPageRepository,
    private dataSource: DataSource,
    private mailerService: MailerService,
    private fundraiserService: FundraiserService
  ) { }

  async getTotalFundraisers() {
    try {
      return await this.fundraiserRepository.count();
    } catch (error) {
      console.log(error);
    }
  }

  async getActiveFundraisers() {
    try {
      return await this.fundraiserRepository.count({
        where: { status: 'active' },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getTodayDonations() {
    try {
      let todayDonations = 0;
      const donations = await this.dataSource
        .getRepository(Donation)
        .createQueryBuilder('donation')
        .where('DATE(donation.created_at)=:date', { date: new Date() })
        .getMany();
      for (let index = 0; index < donations.length; index++) {
        const element = donations[index].amount;
        todayDonations = todayDonations + element;
      }
      return todayDonations;
    } catch (error) {
      console.log(error);
    }
  }

  async getThisMonthDonations() {
    try {
      let thisMonthDonations = 0;
      const donations = await this.dataSource
        .getRepository(Donation)
        .createQueryBuilder('donation')
        .where("date_part('month',donation.created_at)=:date", {
          date: new Date().getMonth() + 1,
        })
        .getMany();
      for (let index = 0; index < donations.length; index++) {
        const element = donations[index].amount;
        thisMonthDonations = thisMonthDonations + element;
      }
      return thisMonthDonations;
    } catch (error) {
      console.log(error);
    }
  }
  async createdByAdmin(createUserDto: any, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    let fundraiser: Fundraiser = new Fundraiser();
    fundraiser.firstName = createUserDto.firstName;
    fundraiser.lastName = createUserDto.lastName;
    fundraiser.email = createUserDto.email;
    fundraiser.password = hashedPassword;
    fundraiser.role = Constants.ROLES.FUNDRAISER_ROLE;
    fundraiser.status = 'active';
    try {
      return await this.fundraiserRepository.save(fundraiser);
    } catch (error) {
      console.log(error);
      return 'Please contact saveRepository';
    }

    // user.user = user1;
    // console.log(user1)
    // user.status = "active";
    // return this.fundraiserRepository.save(user);
  }

  async changeFundraiserStatus(id: string) {
    // return await this.fundraiserRepository.update(id,{status:"inactive"});
    try {
      const fundraiser = await this.fundraiserRepository.findOne({
        where: { fundraiser_id: id },
      });

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser not found');
      }
      console.log(fundraiser.status);
      // Toggle the status based on its current value
      fundraiser.status =
        fundraiser.status === 'active' ? 'inactive' : 'active';

      // Save the updated fundraiser
      await this.fundraiserRepository.update(id, { status: fundraiser.status });
      if (fundraiser.status === 'active') {
        return {
          status: 1,
        };
      } else {
        return {
          status: 0,
        };
      }
    } catch (error) {
      console.log(error);
      return 'Please contact statusmanager';
    }
  }

  async deleteFundraiser(id: string) {
    try {
      let user = await this.fundraiserRepository.findOne({
        where: { fundraiser_id: id },
      });
      if (user.role == 'ADMIN') {
        throw new ForbiddenException('NOT ALLOWED');
      }
      const fundraiser = await this.fundraiserRepository.findOne({
        where: { fundraiser_id: id },
      });

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser not found');
      }

      return await this.fundraiserRepository.delete(id);
    } catch (error) {
      console.log(error);
      return 'Please contact deleteFundraiser';
    }
  }

  async getAllFundraiser() {
    try {
      const fundraisers = await this.fundraiserRepository.find();
      const filteredUsers = fundraisers.filter(
        (fundraiser) => fundraiser.role !== 'ADMIN',
      );
      return filteredUsers;
    } catch (error) {
      console.log(error);
      return 'Please contact getAllFundraiser';
    }
  }

  async generatePasswordByEmail(body) {
    try {
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

        return this.createdByAdmin(body, randomPassword);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async addOfflineDonation(body) {
    try {
      //same code from donate service here admin passes data in body
      let donation: Donation = new Donation();
      let fundraiser: Fundraiser = await this.fundraiserRepository.findOne({
        where: { email: body.email },
        relations: ['fundraiser_page'],
      });
      console.log(fundraiser);
      let fundraiserPage = await this.fundraiserPageRepository.findOne({
        where: { id: fundraiser.fundraiser_page.id },
      });
      console.log(fundraiserPage);
      let supportersOfFundraiser = fundraiserPage.supporters;
      if (supportersOfFundraiser == null) {
        supportersOfFundraiser = [];
      }
      supportersOfFundraiser.push(body.donor_name);
      console.log(supportersOfFundraiser);
      if (fundraiser != null) {
        const total_amount_raised =
          fundraiser.total_amount_raised + parseInt(body.amount);
        const total_donations = fundraiser.total_donations + 1;
        await this.fundraiserRepository.update(fundraiser.fundraiser_id, {
          total_amount_raised: total_amount_raised,
          total_donations: total_donations,
        });
        const newAmount: number =
          fundraiserPage.raised_amount + parseInt(body.amount);
        await this.fundraiserPageRepository.update(fundraiserPage.id, {
          raised_amount: newAmount,
          supporters: supportersOfFundraiser,
        });
      } else {
        return 'Fundraiser Page Not Found';
      }
      if (fundraiser.status == 'active') {
        donation.fundraiser = fundraiser;
        donation.amount = body.amount;
        donation.donor_name = body.donor_name;
        donation.comments = body.comments;
        donation.pan = body.pan;
        donation.donor_email = body.donor_email;
        donation.donor_phone = body.donor_phone;
        donation.donor_address = body.donor_address;
        return this.donationRepository.save(donation);
      } else {
        return 'Fundraiser not active';
      }
    } catch (error) {
      console.log(error);
      return 'Please contact addOfflineDonation';
    }
  }

  async createFundraiserPageByEmail(body) {
    try {
      let fundRaiser = await this.fundraiserService.findFundRaiserByEmail(body.email,);
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

  async getAllDonations() {
    try {
      return await this.donationRepository.find({ relations: ['fundraiser'] });
    } catch (error) {
      console.log(error);

    }
  }

  async getAllFundraiserPages() {
    try {
      return await this.fundraiserPageRepository.find();
    } catch (error) {
      console.log(error);
    }
  }

  async update(body, files, PageId) {
    try {
      //finding fundraiserPage using id from parmameters and updating data using body data
      let fundRaiserPageNew = await this.fundraiserPageRepository.findOne({
        where: { id: PageId },
      });
      console.log(fundRaiserPageNew);
      await this.fundraiserPageRepository.update(PageId, body);

      //accessing existing galley of fundraiserPage and pushing new uploaded files
      const fundraiserGallery = fundRaiserPageNew.gallery;
      for (let i = 0; i < files.length; i++) {
        fundraiserGallery.push(files[i]);
      }
      console.log(fundraiserGallery);

      //saving new data of fundraiserPage with gallery
      await this.fundraiserPageRepository.update(PageId, {
        gallery: fundraiserGallery,
      });
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Not Found');
    }
  }

  async getTotalDonations() {
    try {
      const Donations = await this.donationRepository.find();
      let totalDonations = 0;
      for (let i = 0; i < Donations.length; i++) {
        totalDonations = totalDonations + Donations[i].amount;
      }

      return totalDonations;
    } catch (error) {
      console.log(error);
      return 'Please contact getTotalDonationsService';
    }
  }
}
