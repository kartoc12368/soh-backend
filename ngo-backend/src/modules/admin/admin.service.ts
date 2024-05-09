import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { Donation } from 'src/shared/entity/donation.entity';
import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { DonationRepository } from '../donation/donation.repository';
import { FundraiserPageRepository } from '../fundraiser-page/fundraiser-page.repository';
import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';

import { MailerService } from 'src/shared/utility/mailer/mailer.service';
import { FundraiserService } from '../fundraiser/fundraiser.service';

import { Constants } from 'src/shared/utility/constants';
import { sendEmailDto } from 'src/shared/utility/mailer/mail.interface';
import { incrementDate } from 'src/shared/utility/incrementDate';

import { Between, DataSource, FindOptionsWhere } from 'typeorm';

import { FindDonationsDto } from '../fundraiser/dto/find-donation.dto';

import * as bcrypt from 'bcrypt';

import * as path from 'path';

import { of } from 'rxjs';

import { v4 as uuidv4 } from 'uuid';

import * as exceljs from 'exceljs';

import * as fs from 'fs';

@Injectable()
export class AdminService {
  constructor(
    private fundraiserRepository: FundRaiserRepository,
    private donationRepository: DonationRepository,
    private fundraiserPageRepository: FundraiserPageRepository,

    private mailerService: MailerService,
    private fundraiserService: FundraiserService,

    private dataSource: DataSource,
  ) { }

  async getAdminDashboardData() {
    try {
      const totalDonations = await this.getTotalDonations();

      const totalFundraisers = await this.getTotalFundraisers();

      const activeFundraisers = await this.getActiveFundraisers();

      const todayDonations = await this.getTodayDonations();

      const thisMonthDonations = await this.getThisMonthDonations();

      return { totalDonations, totalFundraisers, activeFundraisers, todayDonations, thisMonthDonations };
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException();
    }
  }

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
        .andWhere('donation.payment_status=:payment_status', { payment_status: 'success' })
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
        .andWhere('donation.payment_status=:payment_status', { payment_status: 'success' })
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
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      let fundraiser: Fundraiser = new Fundraiser();

      fundraiser.firstName = createUserDto.firstName;
      fundraiser.email = createUserDto.email;
      fundraiser.mobile_number = createUserDto.mobile_number;
      fundraiser.password = hashedPassword;
      fundraiser.role = Constants.ROLES.FUNDRAISER_ROLE;
      fundraiser.status = 'active';

      const createdNew = await this.fundraiserRepository.save(fundraiser);

      return { createdNew, status: "201" }
    } catch (error) {
      console.log(error);

      return 'Please contact saveRepository';
    }
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
      // Toggle the status based on its current value
      fundraiser.status = fundraiser.status === 'active' ? 'inactive' : 'active';

      // Save the updated fundraiser
      await this.fundraiserRepository.update(id, { status: fundraiser.status });

      if (fundraiser.status === 'active') {
        return { status: 1 };
      } else {
        return { status: 0 };
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
      const fundraisers = await this.fundraiserRepository.find({ relations: ['fundraiser_page'], order: { f_id: 'ASC' } });

      const filteredUsers = fundraisers.filter((fundraiser) => fundraiser.role !== 'ADMIN');

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
        return new NotFoundException('Email already in use');
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

      let fundraiserPage = await this.fundraiserPageRepository.findOne({
        where: { id: fundraiser.fundraiser_page.id },
      });

      let supportersOfFundraiser = fundraiserPage.supporters;

      if (supportersOfFundraiser == null) {
        supportersOfFundraiser = [];
      }

      supportersOfFundraiser.push(body.donor_name);

      if (fundraiser != null) {
        const total_amount_raised = fundraiser.total_amount_raised + parseInt(body.amount);

        const total_donations = fundraiser.total_donations + 1;

        await this.fundraiserRepository.update(fundraiser.fundraiser_id, {
          total_amount_raised: total_amount_raised,
          total_donations: total_donations,
        });

        const newAmount: number = fundraiserPage.raised_amount + parseInt(body.amount);

        await this.fundraiserPageRepository.update(fundraiserPage.id, {
          raised_amount: newAmount,
          supporters: supportersOfFundraiser,
        });
      } else {
        return 'Fundraiser Page Not Found';
      }
      if (fundraiser.status == 'active') {

        donation = { ...body, payment_type: 'offline', payment_status: 'success' };

        await this.donationRepository.save(donation);

        return { message: 'Donation added successfully' };
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
      let fundRaiser = await this.fundraiserService.findFundRaiserByEmail(body.email);

      let fundRaiserPage = await this.fundraiserPageRepository.findOne({
        where: { fundraiser: { fundraiser_id: fundRaiser.fundraiser_id } },
      });

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

      await this.fundraiserPageRepository.update(PageId, body);

      //accessing existing galley of fundraiserPage and pushing new uploaded files
      const fundraiserGallery = fundRaiserPageNew.gallery;

      for (let i = 0; i < files.length; i++) {
        fundraiserGallery.push(files[i]);
      }

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
      const Donations = await this.donationRepository.find({ where: { payment_status: 'success' } });

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

  async uploadCertificate(file, id) {
    try {
      let donation = await this.donationRepository.findOne({ where: { donation_id: id } });

      return await this.donationRepository.update(donation.donation_id, { certificate: file.filename });
    } catch (error) {
      console.log(error);
    }
  }

  async findCerificate(res, imagename) {
    try {
      return of(res.sendFile(path.join(process.cwd(), '/uploads/80G Certificates/' + imagename)));
    } catch (error) {
      console.log(error);
    }
  }

  async findMany(dto: FindDonationsDto, req) {
    try {
      const { payment_option, payment_status, donation_id, from_date, to_date } = dto;

      let conditions: FindOptionsWhere<Donation> | FindOptionsWhere<Donation>[] = {};

      conditions = {
        ...conditions,
        ...(dto.payment_option ? { payment_type: payment_option } : {}),
        ...(dto.payment_status ? { payment_status: payment_status } : {}),
        ...(dto.donation_id ? { donation_id_frontend: donation_id } : {}),
        ...(dto.from_date || dto.to_date
          ? {
            donation_date: Between(dto.from_date ? new Date(dto.from_date) : new Date('1970-01-01'), dto.to_date ? incrementDate(new Date(to_date)) : new Date()),
          }
          : {}), // Only add filter if either from_date or to_date is provided
      };

      console.log(conditions);

      return await this.donationRepository.find({ relations: { fundraiser: true }, where: conditions, order: { donation_id_frontend: 'ASC' } });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async deleteFundraiserPage(id) {
    return await this.fundraiserPageRepository.delete(id);
  }

  async downloadExcelforDonations(res) {
    try {
      const donations = await this.donationRepository.find();

      const workbook = new exceljs.Workbook();

      const sheet = workbook.addWorksheet('donations');

      sheet.columns = [
        { header: 'Donation Id', key: 'donation_id_frontend' },
        { header: 'Donation Date', key: 'created_at' },
        { header: 'Donor Name', key: 'donor_name' },
        { header: 'Donation Amount', key: 'amount' },
        { header: 'Payment Type', key: 'payment_type' },
        { header: 'Payment Status', key: 'payment_status' },
        { header: '80G Certificate', key: 'certificate' },
      ];

      donations.forEach((value, idx) => {
        sheet.addRow({
          donation_id_frontend: value.donation_id_frontend,
          created_at: value.created_at,
          donor_name: value.donor_name,
          amount: value.amount,
          payment_type: value.payment_type,
          payment_status: value.payment_status,
          certificate: value.certificate,
        });
      });

      const downloadsFolder = path.join(__dirname, '../../../', 'downloads');

      if (!fs.existsSync(downloadsFolder)) {
        try {
          fs.mkdirSync(downloadsFolder);
        } catch (error) {
          console.error('Error creating downloads folder:', error);
        }
      }

      const filename = `${uuidv4()}.xlsx`;

      const filePath = path.join(downloadsFolder, filename);

      await workbook.xlsx.writeFile(filePath);

      return of(res.sendFile(path.join(process.cwd(), 'downloads/' + filename)));
    } catch (error) {
      console.error('Error creating Excel file:', error);
    }
  }

}
