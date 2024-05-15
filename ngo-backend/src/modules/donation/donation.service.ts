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
      const reference = Math.random().toString(36).slice(-8);

      if (!id) {
        await this.donationRepository.createDonationOnline(body, reference);

        return { message: 'Donation received successfully' };
      }

      let fundraiserPage = await this.fundRaiserPageRepository.getFundraiserPage({ where: { id: id }, relations: ['fundraiser'] });
      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser Page not found');
      }

      //getting fundraiser to update its dashboard content
      let fundraiser: Fundraiser = await this.fundRaiserRepository.getFundraiser({ where: { fundraiser_id: fundraiserPage?.fundraiser?.fundraiser_id } });
      if (!fundraiser) {
        throw new NotFoundException('Fundraiser not found, Page is expired');
      }

      //checking if status is active then only fundraiser data is available in donation database
      if (fundraiser?.status == 'inactive') {
        throw new BadRequestException('Fundraiser Status is inactive');
      }

      await this.donationRepository.createDonationOnline(body, reference, fundraiser);

      return { message: 'Donation received successfully', data: { reference: reference, id: id } };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async saveDonation(body): Promise<ResponseStructure> {
    try {
      //getting fundraiser to update its dashboard content
      let fundraiser: Fundraiser = await this.fundRaiserRepository.getFundraiser({ where: { fundraiser_id: body?.fundraiser?.fundraiser_id }, relations: ['fundraiser_page'] });

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser not found');
      }

      let fundraiserPage = await this.fundRaiserPageRepository.getFundraiserPage({
        where: { id: fundraiser?.fundraiser_page?.id },
      });

      if (!fundraiserPage) {
        throw new NotFoundException('Fundraiser Page not found');
      }

      //getting existing fundraiserPage supporters and pushing new supporters
      const supportersOfFundraiser = await this.donationRepository.getDonorNames(body?.fundraiser);

      const total_amount_raised = await this.donationRepository.getRaisedAmount(body?.fundraiser);

      const total_donations = await this.donationRepository.getTotalDonor(body?.fundraiser);

      await this.fundRaiserRepository.UpdateFundraiser(fundraiser?.fundraiser_id, {
        total_amount_raised: total_amount_raised,
        total_donations: total_donations,
      });

      await this.fundRaiserPageRepository.UpdateFundraiserPage(fundraiser?.fundraiser_page?.id, { raised_amount: total_amount_raised, supporters: supportersOfFundraiser });
      return { message: 'Donation updated successfully to Page' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
