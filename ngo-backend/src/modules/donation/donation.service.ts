import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { FundraiserPageRepository } from '../fundraiser-page/fundraiser-page.repository';
import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { DonationRepository } from './donation.repository';

import { Fundraiser } from 'src/shared/entity/fundraiser.entity';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';

@Injectable()
export class DonationService {
  constructor(
    private readonly donationRepository: DonationRepository,
    private readonly fundRaiserRepository: FundRaiserRepository,
    private readonly fundRaiserPageRepository: FundraiserPageRepository,
  ) {}

  async donate(body, id?): Promise<ResponseStructure> {
    try {
      // const reference = Math.random().toString(36).slice(-8);
      const timestamp = Date.now().toString(36);
      const randomPart = Math.random().toString(36).slice(-8);
      const reference = timestamp + randomPart;

      if (!id) {
        await this.donationRepository.createDonationOnline(body, reference);

        return { message: 'Donation Received Successfully', data: { reference: reference } };
      }

      let fundraiserPage = await this.fundRaiserPageRepository.getFundraiserPage({ where: { id: id }, relations: ['fundraiser'] });
      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser Page Not Found');
      }

      //getting fundraiser to update its dashboard content
      let fundraiser: Fundraiser = await this.fundRaiserRepository.getFundraiser({ where: { fundraiser_id: fundraiserPage?.fundraiser?.fundraiser_id } });
      if (!fundraiser) {
        throw new NotFoundException('Fundraiser Not Found, Page Is Expired');
      }

      //checking if status is active then only fundraiser data is available in donation database
      if (fundraiser?.status == 'inactive') {
        throw new BadRequestException('Fundraiser Status Is Inactive');
      }

      await this.donationRepository.createDonationOnline(body, reference, fundraiser);

      return { message: 'Donation Received Successfully', data: { reference: reference, id: id } };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async updateDonation(id, body): Promise<ResponseStructure> {
    try {
      await this.donationRepository.UpdateOneDonation(id, body);

      return { message: 'Donation Updated Successfully' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
  async deleteDonation(id): Promise<ResponseStructure> {
    try {
      await this.donationRepository.deleteDonation(id);

      return { message: 'Donation Deleted Successfully' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getDonationByReference(id): Promise<ResponseStructure> {
    try {
      const donation = await this.donationRepository.getOneDonation({ where: { reference_payment: id } });
      return { message: 'Donation Status', data: donation };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
