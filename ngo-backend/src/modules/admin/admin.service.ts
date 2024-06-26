import { MailerService } from '@nestjs-modules/mailer';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Between, FindOptionsWhere } from 'typeorm';

import { Donation } from 'src/shared/entity/donation.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { DonationRepository } from '../donation/donation.repository';
import { FundraiserPageRepository } from '../fundraiser-page/fundraiser-page.repository';
import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';

import { incrementDate } from 'src/shared/utility/date.utility';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';
import { SendMailerUtility } from 'src/shared/utility/send-mailer.utility';

import { SendEmailDto } from 'src/shared/interface/mail.interface';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';

import { FindDonationsDto } from '../fundraiser/dto/find-donation.dto';
import { CreateFundraiserPageAdminDto } from './dto/create-fundraiserpage-admin.dto';
import { GeneratePasswordDto } from './dto/generate-password.dto';
import { AddOfflineDonationDto } from './dto/offline-donation.dto';

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
      const totalFundraisers = await this.fundraiserRepository.countFundraisers({ where: { role: 'FUNDRAISER' } });

      const activeFundraisers = await this.fundraiserRepository.countFundraisers({ where: { status: 'active', role: 'FUNDRAISER' } });

      const todayDonations = await this.donationRepository.getTodayDonations();

      const thisMonthDonations = await this.donationRepository.getThisMonthDonations();

      const totalDonations = await this.donationRepository.getTotalDonations();

      return { message: 'Dashboard Data Received Successfully', data: { totalDonations, totalFundraisers, activeFundraisers, todayDonations, thisMonthDonations }, success: true };
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

      const donationsData = await this.donationRepository.getAllDonations({ relations: { fundraiser: true }, where: conditions, order: { donation_id_frontend: 'DESC' } });

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
        throw new NotFoundException('Fundraiser Not Found');
      }
      // Toggle the status based on its current value
      fundraiser.status = fundraiser?.status === 'active' ? 'inactive' : 'active';

      // Save the updated fundraiser
      await this.fundraiserRepository.UpdateFundraiser(id, { status: fundraiser?.status });

      if (fundraiser?.status === 'active') {
        return { message: 'Status Changed To Active ', success: true, data: { status: 1 } };
      } else {
        return { message: 'Status Changed To Inactive', success: true, data: { status: 0 } };
      }
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async deleteFundraiser(id: string): Promise<ResponseStructure> {
    try {
      const fundraiser = await this.fundraiserRepository.getFundraiser({ where: { fundraiser_id: id } });

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser Not Found');
      }

      if (fundraiser?.role == 'ADMIN') {
        throw new ForbiddenException('NOT ALLOWED');
      }

      await this.fundraiserRepository.deleteFundraiser(id);

      return { message: 'Fundraiser Deleted Successfully', success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getAllFundraiser(): Promise<ResponseStructure> {
    try {
      const fundraisers = await this.fundraiserRepository.getAllFundraisers({ relations: ['fundraiser_page'], order: { f_id: 'DESC' } });

      const filteredUsers = fundraisers?.filter((fundraiser) => fundraiser?.role !== 'ADMIN');

      return { message: 'Fundraisers Data Fetched Successfully', data: filteredUsers, success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async generatePasswordByEmail(body: GeneratePasswordDto): Promise<ResponseStructure> {
    try {
      const isFundraiserExists = await this.fundraiserRepository.getFundraiser({ where: { email: body?.email } });

      if (isFundraiserExists && isFundraiserExists?.role == 'FUNDRAISER') {
        throw new ConflictException('Fundraiser Already Exists');
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

        return { message: 'Donation Added Successfully' };
      }

      let fundraiser: Fundraiser = await this.fundraiserRepository.getFundraiser({
        where: { email: body?.email },
        relations: ['fundraiser_page'],
      });

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser Not Found');
      }

      if (fundraiser?.status == 'inactive') {
        throw new ForbiddenException('Fundraiser Is Inactive');
      }

      await this.donationRepository.createDonationOffline(body, fundraiser);

      let fundraiserPage = await this.fundraiserPageRepository.getFundraiserPage({
        where: { id: fundraiser?.fundraiser_page?.id },
      });

      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser Page Not Found');
      }

      return { message: 'Donation Added Successfully' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async createFundraiserPageByEmail(body: CreateFundraiserPageAdminDto): Promise<ResponseStructure> {
    try {
      let fundRaiser = await this.fundraiserRepository.findFundRaiserByEmail(body?.email);

      if (!fundRaiser) {
        throw new NotFoundException('Fundraiser Not Found');
      }

      let fundRaiserPage = await this.fundraiserPageRepository.getFundraiserPage({
        where: { fundraiser: { fundraiser_id: fundRaiser?.fundraiser_id } },
      });

      if (fundRaiserPage == null) {
        const fundraiserPage = await this.fundraiserPageRepository.createFundraiserPage(fundRaiser);

        return { message: 'Fundraiser Page Successfully Created', data: fundraiserPage, success: true };
      } else {
        throw new ConflictException('Fundraiser Page Already Exists');
      }
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async deleteFundraiserPage(id: string): Promise<ResponseStructure> {
    try {
      await this.fundraiserPageRepository.deleteFundraiserPage(id);
      return { message: 'Fundraiser Page Deleted Successfully' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getDonationsAdminForDelete(dto: FindDonationsDto): Promise<ResponseStructure> {
    try {
      const { to_date, from_date } = dto;

      const donationsData = await this.donationRepository
        .createQueryBuilder('donation')
        .leftJoinAndSelect('donation.fundraiser', 'fundraiser')
        .where('donation.fundraiser IS NULL')
        .andWhere('donation.donation_date BETWEEN :from_date AND :to_date', {
          from_date: from_date ? new Date(from_date) : new Date('1970-01-01'),
          to_date: to_date ? incrementDate(new Date(to_date)) : new Date(),
        })
        .getMany();
      return { message: 'Donations Received Successfully', data: donationsData, success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async deleteDonations(ids) {
    try {
      return await this.donationRepository.delete(ids['ids']);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
