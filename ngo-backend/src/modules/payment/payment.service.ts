import { Injectable, NotFoundException } from '@nestjs/common';

import { DonationRepository } from '../donation/donation.repository';

import { DonationService } from '../donation/donation.service';

import crypto from 'crypto';

import axios from 'axios';
import Razorpay from 'razorpay';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';

@Injectable()
export class PaymentService {
  constructor(
    private donationRepository: DonationRepository,
    private donationService: DonationService,
  ) {}

  async getInstance(): Promise<any> {
    try {
      const instance = new Razorpay({
        key_id: process?.env?.RAZORPAY_API_KEY,
        key_secret: process?.env?.RAZORPAY_API_SECRET,
      });

      return instance;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async checkout(amount, reference): Promise<ResponseStructure> {
    try {
      let donation = await this.donationRepository.getOneDonation({ where: { reference_payment: reference } });

      if (!donation) {
        throw new NotFoundException('Donation with this reference does not exist');
      }

      amount *= 100;

      const options = {
        amount: parseInt(amount),
        currency: 'INR',
        // receipt: 'order_rcptid_11',
        // payment_capture: 1
      };

      const response = await (await this?.getInstance())?.orders?.create(options);

      await this.donationRepository.UpdateOneDonation(donation?.donation_id, { order_id: response?.id });

      console.log(response);

      return { message: 'Checkout Successful', data: response, success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async paymentVerification(body, res, query): Promise<ResponseStructure> {
    try {
      const { id } = query;

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

      console.log(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      // console.log(res)

      const newBody = razorpay_order_id + '|' + razorpay_payment_id;

      const expectedSignature = crypto.createHmac('sha256', process?.env?.RAZORPAY_API_SECRET).update(newBody.toString()).digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        // Database comes here
        const donation = await this.donationRepository.getOneDonation({ where: { order_id: razorpay_order_id }, relations: ['fundraiser'] });

        if (!donation) {
          throw new NotFoundException('Donation with this order_id does not exist');
        }

        await this.donationRepository.UpdateOneDonation(donation?.donation_id, {
          payment_order_id: razorpay_order_id,
          payment_status: 'success',
          payment_signature: razorpay_signature,
          payment_id: razorpay_payment_id,
        });

        if (id != 'undefined') {
          res.redirect(`http://localhost:3000/paymentsuccess/${id}/?reference=${razorpay_payment_id}`);
          await this.donationService.saveDonation(donation);
        } else {
          res.redirect(`http://localhost:3000/paymentsuccess/?reference=${razorpay_payment_id}`);
        }
      } else {
        return { message: 'Payment is Not Authenticated', success: false };
      }

      return { message: 'Payment Successfully Processed', success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async findAll() {
    const donations = await this.donationRepository.getAllDonations({ where: { payment_status: 'pending' } });
    console.log(donations);
    donations.forEach(async (donation) => {
      const { data } = await axios({
        method: 'GET',
        url: 'https://api.razorpay.com/v1/orders',
        auth: { username: process?.env?.RAZORPAY_API_KEY, password: process?.env?.RAZORPAY_API_SECRET },
      });
      if (data?.amount_due == data?.amount) {
        await this.donationRepository.UpdateOneDonation(donation?.donation_id, { payment_status: 'failed' });
        // await this.donationRepository.deleteDonation(donation.donation_id);
      }
    });
  }
}
