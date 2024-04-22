import { Injectable, NotFoundException } from '@nestjs/common';
import { DonationRepository } from './donation.repository';
import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { FundraiserPageRepository } from '../fundraiser-page/fundraiser-page.repository';
import { Donation } from 'src/shared/entity/donation.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

@Injectable()
export class DonationService {
  constructor(
    private donationRepository: DonationRepository,
    private readonly fundRaiserRepository: FundRaiserRepository,
    private readonly fundRaiserPageRepository: FundraiserPageRepository,
  ) {}

  async donate(body, id?) {
    //making a new donation object to save
    let donation: Donation = new Donation();

    //creating empty supporter array to push to supporters of fundraiserPage
    let supporters = [];
    donation.donor_name = body.donor_name;
    supporters.push(body.donor_name);

    //getting fundraiserPage using id from params if any
    try {
      if (id) {
        let fundraiserPage = await this.fundRaiserPageRepository.findOne({
          where: { id: id },
          relations: ['fundraiser'],
        });
        console.log(fundraiserPage);

        if (!fundraiserPage) {
          throw new NotFoundException('Fundraiser Page not found');
        }

        //getting existing fundraiserPage supporters anf pushing new supporters
        let supportersOfFundraiser = fundraiserPage.supporters;
        for (let i = 0; i < supporters.length; i++) {
          supportersOfFundraiser.push(supporters[i]);
        }

        //getting fundraiser to update its dashboard content
        let fundraiser: Fundraiser = await this.fundRaiserRepository.findOne({
          where: { fundraiser_id: fundraiserPage.fundraiser.fundraiser_id },
        });
        console.log(fundraiser);
        const total_amount_raised =
          fundraiser.total_amount_raised + parseInt(body.amount);
        const total_donations = fundraiser.total_donations + 1;
        await this.fundRaiserRepository.update(fundraiser.fundraiser_id, {
          total_amount_raised: total_amount_raised,
          total_donations: total_donations,
        });

        //getting already raised amount of FundraiserPage and updating amount with supporters
        const newAmount: number =
          fundraiserPage.raised_amount + parseInt(body.amount);
        await this.fundRaiserPageRepository.update(id, {
          raised_amount: newAmount,
          supporters: supportersOfFundraiser,
        });

        //checking if status is active then only fundraiser data is available in donation database
        if (fundraiser.status == 'active') {
          donation.fundraiser = fundraiser;
        }
      }
    } finally {
      //executing a finally block so that no matter what amount saves with name in database
      //[whether user is logged in or not]
      //[whether fundraiser is active or not]
      //[whether fundraiser id is passed or not]
      donation.amount = body.amount;
      donation.pan = body.pan;
      donation.donor_email = body.donor_email;
      donation.donor_phone = body.donor_phone;
      donation.donor_address = body.donor_address;
      donation.comments = body.comments;

      return this.donationRepository.save(donation);
    }
  }
}
