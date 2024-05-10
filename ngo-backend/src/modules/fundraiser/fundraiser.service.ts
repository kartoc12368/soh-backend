import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { Donation } from 'src/shared/entity/donation.entity';
import { FundraiserPage } from 'src/shared/entity/fundraiser-page.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { ChangePasswordDto } from './dto/change-password.dto';
import { FindDonationsDto } from './dto/find-donation.dto';
import { UpdateFundraiserDto } from './dto/update-profile.dto';

import { DonationRepository } from '../donation/donation.repository';
import { FundraiserPageRepository } from '../fundraiser-page/fundraiser-page.repository';
import { FundRaiserRepository } from './fundraiser.repository';

import { incrementDate } from 'src/shared/utility/date.utility';

import { Between, FindOptionsWhere } from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

import * as bcrypt from 'bcrypt';

import * as exceljs from 'exceljs';

import * as fs from 'fs';

import * as path from 'path';

import { of } from 'rxjs';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';
import { downloadDonationsExcel } from 'src/shared/utility/excel.utility';

@Injectable()
export class FundraiserService {
  constructor(
    private fundRaiserRepository: FundRaiserRepository,
    private fundraiserPageRepository: FundraiserPageRepository,
    private donationRepository: DonationRepository,
  ) {}

  async changePassword(req, changePasswordDto: ChangePasswordDto): Promise<ResponseStructure> {
    try {
      const fundraiser: Fundraiser = req.user;

      const fundraiser2 = await this.fundRaiserRepository.getFundraiser({ where: { email: fundraiser.email }, select: ['password', 'fundraiser_id'] });

      var isSame = await bcrypt.compare(changePasswordDto.oldPassword, fundraiser2.password);

      if (!isSame) {
        throw new UnauthorizedException('Old password is incorrect');
      }

      if (changePasswordDto.newPassword === changePasswordDto.confirmPassword) {
        const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

        await this.fundRaiserRepository.UpdateFundraiser(fundraiser2.fundraiser_id, { password: hashedPassword });

        return { message: 'Password updated successfully' };
      } else {
        throw new UnauthorizedException('New password and confirm password do not match');
      }
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getLoggedInFundraiser(user): Promise<ResponseStructure> {
    const id = user;

    try {
      const fundraiser = await this.fundRaiserRepository.getFundraiser({ where: { email: id.email }, relations: ['fundraiser_page'] });
      return { message: 'Fundraiser Fetched Successfully', data: fundraiser, success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async updateFundRaiserById(req, updateFundRaiserDto: UpdateFundraiserDto): Promise<ResponseStructure> {
    try {
      const fundRaiser = await this.fundRaiserRepository.getFundraiser({ where: { fundraiser_id: req.user.id } });

      await this.fundRaiserRepository.update(fundRaiser.fundraiser_id, updateFundRaiserDto);

      return { message: 'Fundraiser Updated Successfully' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getFundraiserPage(user): Promise<ResponseStructure> {
    try {
      let fundRaiser: Fundraiser = await this.fundRaiserRepository.getFundraiser({ where: { fundraiser_id: user.id } });

      if (!fundRaiser) {
        throw new NotFoundException('Fundraiser not found');
      }

      let fundraiserPage = await this.fundraiserPageRepository.getFundraiserPage({ select: ['fundraiser'], where: { fundraiser: { fundraiser_id: fundRaiser.fundraiser_id } } });

      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser Page not found');
      }

      return { message: 'Fundraiser Page Fetched Successfully', data: fundraiserPage, success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async uploadProfileImage(fundraiser, file): Promise<ResponseStructure> {
    try {
      let fundRaiser = await this.fundRaiserRepository.findFundRaiserByEmail(fundraiser.email);

      if (!fundRaiser) {
        throw new NotFoundException('Fundraiser not found');
      }

      await this.fundRaiserRepository.UpdateFundraiser(fundRaiser.fundraiser_id, { profileImage: file.filename });

      return { message: 'Profile image updated successfully', data: { profileImage: file.filename } };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async findProfileImage(res, imagename) {
    try {
      return of(res.sendFile(path.join(process.cwd(), 'uploads/profileImages/' + imagename)));
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async findFundraiserPageImage(res, imagename) {
    try {
      return of(res.sendFile(path.join(process.cwd(), 'uploads/fundraiserPageImages/' + imagename)));
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async createFundraiserPage(user) {
    try {
      let fundRaiser = await this.fundRaiserRepository.findFundRaiserByEmail(user.email);
      if (!fundRaiser) {
        throw new NotFoundException('Fundraiser not found');
      }

      let fundRaiserPage = await this.fundraiserPageRepository.getFundraiserPage({ where: { fundraiser: { fundraiser_id: fundRaiser.fundraiser_id } } });

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

  async getDonationFundraiser(dto: FindDonationsDto, req) {
    try {
      const { payment_option, payment_status, donation_id, from_date, to_date } = dto;

      let conditions: FindOptionsWhere<Donation> | FindOptionsWhere<Donation>[] = {};

      conditions = {
        ...conditions,
        ...(payment_option ? { payment_type: payment_option } : {}),
        ...(payment_status ? { payment_status: payment_status } : {}),
        ...(req.user.id ? { fundraiser: { fundraiser_id: req.user.id } } : {}),
        ...(donation_id ? { donation_id_frontend: donation_id } : {}),
        ...(from_date || to_date
          ? {
              donation_date: Between(from_date ? new Date(from_date) : new Date('1970-01-01'), to_date ? incrementDate(new Date(to_date)) : new Date()),
            }
          : {}), // Only add filter if either from_date or to_date is provided
      };
      console.log(conditions);

      return await this.donationRepository.getAllDonations({ relations: { fundraiser: true }, where: conditions, order: { donation_id_frontend: 'ASC' } });
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async downloadExcelforDonations(user, res): Promise<any> {
    try {
      const donations = await this.donationRepository.getAllDonations({
        where: { fundraiser: { fundraiser_id: user?.id } }, // Filter by fundraiser
      });

      const filename = await downloadDonationsExcel(donations);

      return of(res.sendFile(path?.join(process.cwd(), 'downloads/' + filename)));
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getRaisedAmount(user): Promise<ResponseStructure> {
    try {
      const fundRaiser = await this.getLoggedInFundraiser(user);
      const totalDonor = await this.donationRepository.getTotalDonor(fundRaiser);
      const amount = await this.donationRepository.getRaisedAmount(fundRaiser);
      const donorNames = await this.donationRepository.getDonorNames(fundRaiser);
      return { message: 'Raised Amount Fetched Successfully', data: { totalDonor, amount, donorNames } };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
