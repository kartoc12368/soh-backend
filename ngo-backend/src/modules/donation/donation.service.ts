import { Injectable, NotFoundException } from '@nestjs/common';

import { Donation } from 'src/shared/entity/donation.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { FundraiserPageRepository } from '../fundraiser-page/fundraiser-page.repository';
import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { DonationRepository } from './donation.repository';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class DonationService {
  constructor(
    private readonly donationRepository: DonationRepository,
    private readonly fundRaiserRepository: FundRaiserRepository,
    private readonly fundRaiserPageRepository: FundraiserPageRepository,
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

        //checking if status is active then only fundraiser data is available in donation database
        if (fundraiser.status == 'active') {
          donation.fundraiser = fundraiser;
        }

        //executing a finally block so that no matter what amount saves with name in database
        //[whether user is logged in or not]
        //[whether fundraiser is active or not]
        //[whether fundraiser id is passed or not]
        donation.donor_name = body.donor_name;
        donation.amount = body.amount;
        donation.pan = body.pan;
        donation.donor_email = body.donor_email;
        donation.donor_phone = body.donor_phone;
        donation.donor_address = body.donor_address;
        donation.comments = body.comments;
        donation.donation_date = new Date();
        donation.donor_city = body.donor_city;
        donation.donor_state = body.donor_state;
        donation.donor_country = body.donor_country;
        donation.donor_bankName = body.donor_bankName;
        donation.donor_bankBranch = body.donor_bankBranch;
        donation.donor_pincode = body.donor_pincode;
        donation.reference_payment = reference;

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
      console.log(body)
      //creating empty supporter array to push to supporters of fundraiserPage

      let supporters = [];

      supporters.push(body.donor_name);
      //getting fundraiser to update its dashboard content
      let fundraiser: Fundraiser = await this.fundRaiserRepository.findOne({ where: { fundraiser_id: body.fundraiser.fundraiser_id }, relations: ["fundraiser_page"] });
      console.log(fundraiser)
      if (fundraiser.fundraiser_id) {
        let fundraiserPage = await this.fundRaiserPageRepository.getFundraiserPage(fundraiser.fundraiser_page.id);
        console.log(fundraiserPage)
        if (!fundraiserPage) {
          throw new NotFoundException('Fundraiser Page not found');
        }

        //getting existing fundraiserPage supporters anf pushing new supporters
        let supportersOfFundraiser = fundraiserPage.supporters;

        for (let i = 0; i < supporters.length; i++) {
          supportersOfFundraiser.push(supporters[i]);
        }


        const total_amount_raised = fundraiser.total_amount_raised + parseInt(body.amount);

        const total_donations = fundraiser.total_donations + 1;

        await this.fundRaiserRepository.update(fundraiser.fundraiser_id, {
          total_amount_raised: total_amount_raised,
          total_donations: total_donations,
        });

        //getting already raised amount of FundraiserPage and updating amount with supporters
        const newAmount: number = fundraiserPage.raised_amount + parseInt(body.amount);

        await this.fundRaiserPageRepository.update(fundraiser.fundraiser_id, { raised_amount: newAmount, supporters: supportersOfFundraiser });

      }
    } catch (error) {
      console.log(error);

    }
  }
}
