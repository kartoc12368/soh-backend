import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import { of } from 'rxjs';

import { Donation } from 'src/shared/entity/donation.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { ChangePasswordDto } from './dto/change-password.dto';
import { FindDonationsDto } from './dto/find-donation.dto';
import { UpdateFundraiserDto } from './dto/update-profile.dto';

import { DonationRepository } from '../donation/donation.repository';
import { FundraiserPageRepository } from '../fundraiser-page/fundraiser-page.repository';
import { FundRaiserRepository } from './fundraiser.repository';

import { incrementDate } from 'src/shared/utility/date.utility';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';
import { downloadDonationsExcel } from 'src/shared/utility/excel.utility';

import { Between, FindOptionsWhere } from 'typeorm';
import { FundraiserCampaignImagesRepository } from '../fundraiser-page/fundraiser-campaign-images.repository';

@Injectable()
export class FundraiserService {
  constructor(
    private fundRaiserRepository: FundRaiserRepository,
    private fundraiserPageRepository: FundraiserPageRepository,
    private donationRepository: DonationRepository,
    private fundraiserCampaignImagesRepository: FundraiserCampaignImagesRepository,
  ) {}

  async changePassword(user, changePasswordDto: ChangePasswordDto): Promise<ResponseStructure> {
    try {
      const fundraiser: Fundraiser = user;

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser Not Found');
      }

      const fundraiser2 = await this.fundRaiserRepository.getFundraiser({ where: { email: fundraiser?.email }, select: ['password', 'fundraiser_id'] });

      const isSame = await bcrypt.compare(changePasswordDto.oldPassword, fundraiser2.password);

      if (!isSame) {
        throw new UnauthorizedException('Old Password Is Incorrect');
      }

      if (changePasswordDto.newPassword === changePasswordDto.confirmPassword) {
        const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

        await this.fundRaiserRepository.UpdateFundraiser(fundraiser2?.fundraiser_id, { password: hashedPassword });

        return { message: 'Password Updated Successfully' };
      } else {
        throw new UnauthorizedException('New Password and Confirm Password do not match');
      }
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getLoggedInFundraiser(user): Promise<ResponseStructure> {
    try {
      const fundRaiser: Fundraiser = user;

      const fundraiser = await this.fundRaiserRepository.getFundraiser({ where: { email: fundRaiser?.email }, relations: ['fundraiser_page'] });

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser Not Found');
      }
      const FundraiserRaisedAmount = await this.getRaisedAmount(fundraiser);

      return { message: 'Fundraiser Fetched Successfully', data: { fundraiser: fundraiser, dashboard_data: FundraiserRaisedAmount }, success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async updateFundRaiserById(user, updateFundRaiserDto: UpdateFundraiserDto): Promise<ResponseStructure> {
    try {
      const fundRaiser = await this.fundRaiserRepository.getFundraiser({ where: { fundraiser_id: user?.id } });

      if (!fundRaiser) {
        throw new NotFoundException('Fundraiser Not Found');
      }

      await this.fundRaiserRepository.UpdateFundraiser(fundRaiser?.fundraiser_id, updateFundRaiserDto);

      return { message: 'Fundraiser Updated Successfully' };
    } catch (error) {
      console.log(error);
      // await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getFundraiserPage(user): Promise<ResponseStructure> {
    try {
      let fundRaiser: Fundraiser = await this.fundRaiserRepository.getFundraiser({ where: { fundraiser_id: user?.id } });

      if (!fundRaiser) {
        throw new NotFoundException('Fundraiser Not Found');
      }

      let fundraiserPage = await this.fundraiserPageRepository.getFundraiserPage({ select: ['fundraiser'], where: { fundraiser: { fundraiser_id: fundRaiser?.fundraiser_id } } });

      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser Page Not Found');
      }

      return { message: 'Fundraiser Page Fetched Successfully', data: fundraiserPage, success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async uploadProfileImage(fundraiser, file): Promise<ResponseStructure> {
    try {
      let fundRaiser = await this.fundRaiserRepository.findFundRaiserByEmail(fundraiser?.email);

      if (!fundRaiser) {
        throw new NotFoundException('Fundraiser Not Found');
      }

      await this.fundRaiserRepository.UpdateFundraiser(fundRaiser?.fundraiser_id, { profileImage: file?.filename });

      return { message: 'Profile Image Updated Successfully', data: { profileImage: file?.filename } };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async findProfileImage(res, imagename): Promise<any> {
    try {
      if (imagename == 'undefined') {
        throw new BadRequestException('Imagename is undefined');
      }
      return of(res.sendFile(path.join(process.cwd(), 'uploads/profileImages/' + imagename)));
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async findFundraiserPageImage(res, imagename): Promise<any> {
    try {
      return of(res.sendFile(path.join(process.cwd(), 'uploads/fundraiserPageImages/' + imagename)));
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async createFundraiserPage(user): Promise<ResponseStructure> {
    try {
      let fundRaiser = await this.fundRaiserRepository.findFundRaiserByEmail(user?.email);
      if (!fundRaiser) {
        throw new NotFoundException('Fundraiser Not Found');
      }

      let fundRaiserPage = await this.fundraiserPageRepository.getFundraiserPage({ where: { fundraiser: { fundraiser_id: fundRaiser?.fundraiser_id } } });

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

  async getDonationFundraiser(dto: FindDonationsDto, user): Promise<ResponseStructure> {
    try {
      const { payment_option, payment_status, donation_id, from_date, to_date } = dto;

      let conditions: FindOptionsWhere<Donation> | FindOptionsWhere<Donation>[] = {};

      conditions = {
        ...conditions,
        ...(payment_option ? { payment_type: payment_option } : {}),
        ...(payment_status ? { payment_status: payment_status } : {}),
        ...(user?.id ? { fundraiser: { fundraiser_id: user?.id } } : {}),
        ...(donation_id ? { donation_id_frontend: donation_id } : {}),
        ...(from_date || to_date
          ? {
              donation_date: Between(from_date ? new Date(from_date) : new Date('1970-01-01'), to_date ? incrementDate(new Date(to_date)) : new Date()),
            }
          : {}), // Only add filter if either from_date or to_date is provided
      };

      const donations = await this.donationRepository.getAllDonations({ relations: { fundraiser: true }, where: conditions, order: { donation_id_frontend: 'DESC' } });
      return { message: 'Donations Fetched Successfully', data: donations };
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

      if (!filename) {
        throw new NotFoundException('Filename Not Found');
      }

      return of(res.sendFile(path?.join(process.cwd(), 'downloads/' + filename)));
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getRaisedAmount(fundRaiser): Promise<any> {
    try {
      const totalDonor = await this.donationRepository.getTotalDonor(fundRaiser);
      const amount = await this.donationRepository.getRaisedAmount(fundRaiser);
      const donorNames = await this.donationRepository.getDonorNames(fundRaiser);
      return { totalDonor, amount };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
