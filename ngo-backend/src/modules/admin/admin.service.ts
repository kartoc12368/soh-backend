import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Between, FindOptionsWhere } from 'typeorm';
import * as path from 'path';
import { of } from 'rxjs';

import { Donation } from 'src/shared/entity/donation.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { DonationRepository } from '../donation/donation.repository';
import { FundraiserPageRepository } from '../fundraiser-page/fundraiser-page.repository';
import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';

import { incrementDate } from 'src/shared/utility/date.utility';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';
import { downloadDonationsExcel } from 'src/shared/utility/excel.utility';
import { SendMailerUtility } from 'src/shared/utility/send-mailer.utility';

import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { SendEmailDto } from 'src/shared/interface/mail.interface';

import { FindDonationsDto } from '../fundraiser/dto/find-donation.dto';
import { GeneratePasswordDto } from './dto/generate-password.dto';
import { AddOfflineDonationDto } from './dto/offline-donation.dto';
import { CreateFundraiserPageAdminDto } from './dto/create-fundraiserpage-admin.dto';
import { Response } from 'express';

@Injectable()
export class AdminService {
  constructor(
    private readonly fundraiserRepository: FundRaiserRepository,
    private readonly donationRepository: DonationRepository,
    private readonly fundraiserPageRepository: FundraiserPageRepository,
    private readonly mailerService: MailerService,
  ) {}

  async getAdminDashboardData(): Promise<ResponseStructure> {
    try {
      const totalFundraisers = await this.fundraiserRepository.countFundraisers();

      const activeFundraisers = await this.fundraiserRepository.countFundraisers({ where: { status: 'active' } });

      const todayDonations = await this.donationRepository.getTodayDonations();

      const thisMonthDonations = await this.donationRepository.getThisMonthDonations();

      const totalDonations = await this.donationRepository.getTotalDonations();

      return { message: 'Dashboard Data received successfully', data: { totalDonations, totalFundraisers, activeFundraisers, todayDonations, thisMonthDonations }, success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getDonationsAdmin(dto: FindDonationsDto): Promise<ResponseStructure> {
    try {
      const { payment_option, payment_status, donation_id, from_date, to_date } = dto;

      let conditions: FindOptionsWhere<Donation> | FindOptionsWhere<Donation>[] = {};

      conditions = {
        ...conditions,
        ...(payment_option ? { payment_type: payment_option } : {}),
        ...(payment_status ? { payment_status: payment_status } : {}),
        ...(donation_id ? { donation_id_frontend: donation_id } : {}),
        ...(from_date || to_date
          ? {
              donation_date: Between(from_date ? new Date(from_date) : new Date('1970-01-01'), to_date ? incrementDate(new Date(to_date)) : new Date()),
            }
          : {}), // Only add filter if either from_date or to_date is provided
      };

      const donationsData = await this.donationRepository.getAllDonations({ relations: { fundraiser: true }, where: conditions, order: { donation_id_frontend: 'ASC' } });

      return { message: 'Donations Received Successfully', data: donationsData, success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async createdByAdmin(generatePasswordDto: GeneratePasswordDto, password: string): Promise<ResponseStructure> {
    try {
      const createdNew = await this.fundraiserRepository.createFundraiserByAdmin(generatePasswordDto, password);

      return { message: 'Password Generated Successfully', data: createdNew, statusCode: 201 };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async changeFundraiserStatus(id: string): Promise<ResponseStructure> {
    try {
      const fundraiser = await this.fundraiserRepository.getFundraiser({ where: { fundraiser_id: id } });

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser not found');
      }
      // Toggle the status based on its current value
      fundraiser.status = fundraiser?.status === 'active' ? 'inactive' : 'active';

      // Save the updated fundraiser
      await this.fundraiserRepository.UpdateFundraiser(id, { status: fundraiser?.status });

      if (fundraiser?.status === 'active') {
        return { message: 'Status changed to active ', success: true };
      } else {
        return { message: 'Status changed to inactive', success: true };
      }
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async deleteFundraiser(id: string): Promise<ResponseStructure> {
    try {
      const fundraiser = await this.fundraiserRepository.getFundraiser({ where: { fundraiser_id: id } });

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser not found');
      }

      if (fundraiser?.role == 'ADMIN') {
        throw new ForbiddenException('NOT ALLOWED');
      }

      await this.fundraiserRepository.deleteFundraiser(id);

      return { message: 'Fundraiser deleted successfully', success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getAllFundraiser(): Promise<ResponseStructure> {
    try {
      const fundraisers = await this.fundraiserRepository.getAllFundraisers({ relations: ['fundraiser_page'], order: { f_id: 'ASC' } });

      const filteredUsers = fundraisers?.filter((fundraiser) => fundraiser?.role !== 'ADMIN');

      return { message: 'Fundraisers data fetched successfully', data: filteredUsers, success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async generatePasswordByEmail(body: GeneratePasswordDto): Promise<ResponseStructure> {
    try {
      const isFundraiserExists = await this.fundraiserRepository.getFundraiser({ where: { email: body?.email } });

      if (isFundraiserExists && isFundraiserExists?.role == 'FUNDRAISER') {
        throw new ConflictException('Email already in use');
      } else {
        //generating random password in randomPassword variable
        const randomPassword = Math?.random()?.toString(36)?.slice(-8);

        const sendEmailDto: SendEmailDto = {
          firstName: body?.firstName,
          password: randomPassword,
          recipients: [{ name: body.firstName, address: body.email }],
        };

        await new SendMailerUtility(this.mailerService).generatePassword(sendEmailDto);

        return this.createdByAdmin(body, randomPassword);
      }
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async addOfflineDonation(body: AddOfflineDonationDto): Promise<ResponseStructure> {
    try {
      //same code from donate service here admin passes data in body
      if (!body?.email) {
        await this.donationRepository.createDonationOffline(body);

        return { message: 'Donation added successfully' };
      }

      let fundraiser: Fundraiser = await this.fundraiserRepository.getFundraiser({
        where: { email: body?.email },
        relations: ['fundraiser_page'],
      });

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser not found');
      }

      if (fundraiser?.status == 'inactive') {
        throw new ForbiddenException('Fundraiser is inactive');
      }

      await this.donationRepository.createDonationOffline(body, fundraiser);

      let fundraiserPage = await this.fundraiserPageRepository.getFundraiserPage({
        where: { id: fundraiser?.fundraiser_page?.id },
      });

      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser page not found');
      }

      //getting existing fundraiserPage supporters and pushing new supporters
      const supportersOfFundraiser = await this.donationRepository.getDonorNames(fundraiser);

      const total_amount_raised = await this.donationRepository.getRaisedAmount(fundraiser);

      const total_donations = await this.donationRepository.getTotalDonor(fundraiser);

      await this.fundraiserRepository.UpdateFundraiser(fundraiser?.fundraiser_id, {
        total_amount_raised: total_amount_raised,
        total_donations: total_donations,
      });

      await this.fundraiserPageRepository.UpdateFundraiserPage(fundraiserPage?.id, {
        raised_amount: total_amount_raised,
        supporters: supportersOfFundraiser,
      });

      return { message: 'Donation added successfully' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async createFundraiserPageByEmail(body: CreateFundraiserPageAdminDto): Promise<ResponseStructure> {
    try {
      let fundRaiser = await this.fundraiserRepository.findFundRaiserByEmail(body?.email);

      if (!fundRaiser) {
        throw new NotFoundException('Fundraiser not found');
      }

      let fundRaiserPage = await this.fundraiserPageRepository.getFundraiserPage({
        where: { fundraiser: { fundraiser_id: fundRaiser?.fundraiser_id } },
      });

      if (fundRaiserPage == null) {
        const fundraiserPage = await this.fundraiserPageRepository.createFundraiserPage(fundRaiser);

        return { message: 'Fundraiser page successfully created', data: fundraiserPage, success: true };
      } else {
        throw new ConflictException('Fundraiser Page already exists');
      }
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async deleteFundraiserPage(id: string): Promise<ResponseStructure> {
    try {
      await this.fundraiserPageRepository.deleteFundraiserPage(id);
      return { message: 'Fundraiser page deleted successfully' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async downloadExcelforDonations(res: Response): Promise<any> {
    try {
      const donations = await this.donationRepository.getAllDonations();

      if (!donations) {
        throw new NotFoundException('Donations not found');
      }

      const filename = await downloadDonationsExcel(donations);

      if (!filename) {
        throw new NotFoundException('Filename not found');
      }

      return of(res.sendFile(path.join(process.cwd(), 'downloads/' + filename)));
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
