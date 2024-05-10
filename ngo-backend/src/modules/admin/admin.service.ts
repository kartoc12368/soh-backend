import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';

import { Donation } from 'src/shared/entity/donation.entity';
import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { DonationRepository } from '../donation/donation.repository';
import { FundraiserPageRepository } from '../fundraiser-page/fundraiser-page.repository';
import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';

import { MailerService } from 'src/shared/utility/mailer/mailer.service';
import { FundraiserService } from '../fundraiser/fundraiser.service';

import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { incrementDate } from 'src/shared/utility/date.utility';
import { sendEmailDto } from 'src/shared/utility/mailer/mail.interface';

import { Between, FindOptionsWhere } from 'typeorm';

import { FindDonationsDto } from '../fundraiser/dto/find-donation.dto';

import { of } from 'rxjs';

import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';
import { GeneratePasswordDto } from './dto/generate-password.dto';
import { downloadDonationsExcel } from 'src/shared/utility/excel.utility';

@Injectable()
export class AdminService {
  constructor(
    private fundraiserRepository: FundRaiserRepository,
    private donationRepository: DonationRepository,
    private fundraiserPageRepository: FundraiserPageRepository,

    private mailerService: MailerService,
    private fundraiserService: FundraiserService,
  ) {}

  async getAdminDashboardData(): Promise<ResponseStructure> {
    try {
      const totalFundraisers = await this.fundraiserRepository.countFundraisers({});

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
      fundraiser.status = fundraiser.status === 'active' ? 'inactive' : 'active';

      // Save the updated fundraiser
      await this.fundraiserRepository.UpdateFundraiser(id, { status: fundraiser.status });

      if (fundraiser.status === 'active') {
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

      if (fundraiser.role == 'ADMIN') {
        throw new ForbiddenException('NOT ALLOWED');
      }

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser not found');
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

  async generatePasswordByEmail(body): Promise<ResponseStructure> {
    try {
      const isFundraiserExists = await this.fundraiserRepository.getFundraiser({ where: { email: body.email } });

      if (isFundraiserExists && isFundraiserExists.role == 'FUNDRAISER') {
        throw new NotFoundException('Email already in use');
      } else {
        //generating random password in randomPassword variable
        var randomPassword = Math?.random()?.toString(36)?.slice(-8);

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

        await this.mailerService?.sendMail(dto);

        return this.createdByAdmin(body, randomPassword);
      }
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async addOfflineDonation(body): Promise<ResponseStructure> {
    try {
      //same code from donate service here admin passes data in body

      if (!body.email) {
        await this.donationRepository.createDonationOffline(body);

        return { message: 'Donation added successfully' };
      }

      let fundraiser: Fundraiser = await this.fundraiserRepository.getFundraiser({
        where: { email: body.email },
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
        where: { id: fundraiser.fundraiser_page.id },
      });

      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser page not found');
      }

      //getting existing fundraiserPage supporters and pushing new supporters
      let supportersOfFundraiser = await this.donationRepository.getDonorNames(fundraiser);

      const total_amount_raised = await this.donationRepository.getRaisedAmount(fundraiser);

      const total_donations = await this.donationRepository.getTotalDonor(fundraiser);

      await this.fundraiserRepository.UpdateFundraiser(fundraiser.fundraiser_id, {
        total_amount_raised: total_amount_raised,
        total_donations: total_donations,
      });

      await this.fundraiserPageRepository.UpdateFundraiserPage(fundraiserPage.id, {
        raised_amount: total_amount_raised,
        supporters: supportersOfFundraiser,
      });

      return { message: 'Donation added successfully' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async createFundraiserPageByEmail(body): Promise<ResponseStructure> {
    try {
      let fundRaiser = await this.fundraiserRepository.findFundRaiserByEmail(body.email);

      let fundRaiserPage = await this.fundraiserPageRepository.getFundraiserPage({
        where: { fundraiser: { fundraiser_id: fundRaiser.fundraiser_id } },
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

  async update(body, files, PageId): Promise<ResponseStructure> {
    try {
      //finding fundraiserPage using id from parmameters and updating data using body data
      let fundRaiserPageNew = await this.fundraiserPageRepository.getFundraiserPage({
        where: { id: PageId },
      });

      if (!fundRaiserPageNew) {
        throw new NotFoundException('Fundraiser Page not found');
      }

      await this.fundraiserPageRepository.UpdateFundraiserPage(PageId, body);

      //accessing existing galley of fundraiserPage and pushing new uploaded files
      const fundraiserGallery = fundRaiserPageNew?.gallery;

      // if (!files?.length) {
      //   throw new NotFoundException("File not Uploaded");
      // }

      for (let i = 0; i < files?.length; i++) {
        fundraiserGallery?.push(files[i]);
      }

      //saving new data of fundraiserPage with gallery
      await this.fundraiserPageRepository.UpdateFundraiserPage(PageId, {
        gallery: fundraiserGallery,
      });
      return { message: 'FundraiserPage updated successfully' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async deleteFundraiserPage(id): Promise<ResponseStructure> {
    try {
      await this.fundraiserPageRepository.deleteFundraiserPage(id);
      return { message: 'Fundraiser page deleted successfully' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async downloadExcelforDonations(res): Promise<any> {
    try {
      const donations = await this.donationRepository.find();

      const filename = await downloadDonationsExcel(donations);

      return of(res.sendFile(path.join(process.cwd(), 'downloads/' + filename)));
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
