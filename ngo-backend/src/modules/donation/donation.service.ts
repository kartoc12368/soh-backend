import { Injectable, NotFoundException } from '@nestjs/common';

import { Donation } from 'src/shared/entity/donation.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { FundraiserPageRepository } from '../fundraiser-page/fundraiser-page.repository';
import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { DonationRepository } from './donation.repository';
import { FundraiserService } from '../fundraiser/fundraiser.service';

@Injectable()
export class DonationService {
  constructor(
    private readonly donationRepository: DonationRepository,
    private readonly fundRaiserRepository: FundRaiserRepository,
    private readonly fundRaiserPageRepository: FundraiserPageRepository,

    private readonly fundraiserService: FundraiserService,
  ) { }

  async donate(body, id?) {
    try {
      //making a new donation object to save
      let donation: Donation = new Donation();

      var reference = Math.random().toString(36).slice(-8);

      if (id) {
        let fundraiserPage = await this.fundRaiserPageRepository.getFundraiserPage(id);

        if (!fundraiserPage) {
          throw new NotFoundException('Fundraiser Page not found');
        }
        //getting fundraiser to update its dashboard content
        let fundraiser: Fundraiser = await this.fundRaiserRepository.findOne({ where: { fundraiser_id: fundraiserPage.fundraiser.fundraiser_id } });

        donation = { ...body, donation_date: new Date(), reference_payment: reference };

        //checking if status is active then only fundraiser data is available in donation database
        if (fundraiser.status == 'active') {
          donation.fundraiser = fundraiser;
        }

        await this.donationRepository.save(donation);

        console.log(reference)

        return { message: 'Donation received successfully', reference: reference, id: id };
      }
    } catch (error) {
      console.log(error);
    }
  }



  async saveDonation(body) {

    //getting fundraiserPage using id from params if any
    try {
      //getting fundraiser to update its dashboard content
      let fundraiser: Fundraiser = await this.fundRaiserRepository.findOne({ where: { fundraiser_id: body.fundraiser.fundraiser_id }, relations: ["fundraiser_page"] });

      if (fundraiser.fundraiser_id) {
        let fundraiserPage = await this.fundRaiserPageRepository.getFundraiserPage(fundraiser.fundraiser_page.id);

        if (!fundraiserPage) {
          throw new NotFoundException('Fundraiser Page not found');
        }

        //getting existing fundraiserPage supporters anf pushing new supporters
        let supportersOfFundraiser = await this.fundraiserService.getDonorNames(body.fundraiser)

        const total_amount_raised = await this.fundraiserService.getRaisedAmount(body.fundraiser)

        const total_donations = await this.fundraiserService.getTotalDonor(body.fundraiser);

        await this.fundRaiserRepository.update(fundraiser.fundraiser_id, {
          total_amount_raised: total_amount_raised,
          total_donations: total_donations,
        });

        //getting already raised amount of FundraiserPage and updating amount with supporters
        // const newAmount: number = fundraiserPage.raised_amount + parseInt(body.amount);

        console.log(await this.fundRaiserPageRepository.update(fundraiser.fundraiser_page.id, { raised_amount: total_amount_raised, supporters: supportersOfFundraiser }));

      }
    } catch (error) {
      console.log(error);

    }
  }
}
