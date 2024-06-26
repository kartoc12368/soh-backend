import { Injectable, NotFoundException } from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Donation } from 'src/shared/entity/donation.entity';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';

@Injectable()
export class DonationRepository extends Repository<Donation> {
  constructor(private dataSource: DataSource) {
    super(Donation, dataSource.createEntityManager());
  }

  async getTodayDonations(): Promise<any> {
    try {
      let todayDonations = 0;

      const donations = await this.dataSource
        .getRepository(Donation)
        .createQueryBuilder('donation')
        .where('DATE(donation.donation_date)=:date', { date: new Date() })
        .andWhere('donation.payment_status=:payment_status', { payment_status: 'success' })
        .getMany();

      if (!donations?.length && donations?.length != 0) {
        throw new NotFoundException('Donations Not Found');
      }

      for (let index = 0; index < donations?.length; index++) {
        const element = donations[index]?.amount;

        if (!element) {
          throw new NotFoundException('Amount not found');
        }

        todayDonations += element;
      }

      return todayDonations;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getThisMonthDonations(): Promise<any> {
    try {
      let thisMonthDonations = 0;

      const donations = await this.dataSource
        .getRepository(Donation)
        .createQueryBuilder('donation')
        .where("date_part('month',donation.donation_date)=:date", {
          date: new Date().getMonth() + 1,
        })
        .andWhere('donation.payment_status=:payment_status', { payment_status: 'success' })
        .getMany();

      if (!donations?.length && donations?.length != 0) {
        throw new NotFoundException('Donations not found');
      }

      for (let index = 0; index < donations.length; index++) {
        const element = donations[index].amount;

        if (!element) {
          throw new NotFoundException('Amount not found');
        }

        thisMonthDonations += element;
      }

      return thisMonthDonations;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getTotalDonations() {
    try {
      const Donations = await this.find({ where: { payment_status: 'success' } });

      let totalDonations = 0;

      for (let i = 0; i < Donations.length; i++) {
        totalDonations = totalDonations + Donations[i].amount;
      }

      return totalDonations;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async createDonationOffline(body, fundraiser?) {
    try {
      let donation: Donation = new Donation();

      donation = { ...body, payment_type: 'offline', payment_status: 'success', fundraiser: fundraiser };

      await this.save(donation);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async createDonationOnline(body, reference, fundraiser?) {
    try {
      let donation: Donation = new Donation();

      donation = { ...body, donation_date: new Date(), reference_payment: reference, fundraiser: fundraiser };

      await this.save(donation);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getDonorNames(user) {
    let supporters = [];

    let donations = await this.dataSource
      .getRepository(Donation)
      .createQueryBuilder('donation')
      .select(['donation.donor_first_name', 'donation.donor_last_name', 'donation.donor_phone'])
      .innerJoin('donation.fundraiser', 'fundraiser')
      .where('fundraiser.fundraiser_id = :fundraiserId', { fundraiserId: user.fundraiser_id })
      .groupBy('donation.donor_phone')
      .addGroupBy('donation.donor_first_name')
      .addGroupBy('donation.donor_last_name')
      // .having('COUNT(*) = 1')
      .getRawMany();

    for (let index = 0; index < donations.length; index++) {
      if (!donations[index]?.donation_donor_last_name) {
        donations[index].donation_donor_last_name = '';
      }
      supporters.push(donations[index]?.donation_donor_first_name + ' ' + donations[index]?.donation_donor_last_name);
    }

    return supporters;
  }

  async getRaisedAmount(user) {
    try {
      let raisedAmount = 0;

      let donations = await this.find({ where: { fundraiser: { fundraiser_id: user.fundraiser_id }, payment_status: 'success' }, relations: ['fundraiser'] });

      for (let index = 0; index < donations.length; index++) {
        const element = donations[index].amount;

        raisedAmount = raisedAmount + element;
      }

      return raisedAmount;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getTotalDonor(user) {
    try {
      let donations = await this.count({ where: { fundraiser: { fundraiser_id: user.fundraiser_id }, payment_status: 'success' }, relations: ['fundraiser'] });

      return donations;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getAllDonations(obj?: object) {
    try {
      return await this.find(obj);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getOneDonation(obj: object) {
    try {
      return await this.findOne(obj);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async UpdateOneDonation(id, setObj: object) {
    try {
      return await this.update(id, setObj);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async deleteDonation(id: string) {
    try {
      return await this.delete(id);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
