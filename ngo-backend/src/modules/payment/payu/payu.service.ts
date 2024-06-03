import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';

import crypto from 'crypto';

import { DonationRepository } from 'src/modules/donation/donation.repository';
import { DonationService } from 'src/modules/donation/donation.service';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';

function generateHash(params, salt) {
  let hashString = params['key'] + '|' + params['txnid'] + '|' + params['amount'] + '|' + params['productinfo'] + '|' + params['firstname'] + '|' + params['email'] + '|||||||||||' + salt;
  console.log(hashString);

  // Generate the hash
  const hash = sha512(hashString);

  return hash;
}

function sha512(str) {
  return crypto.createHash('sha512').update(str).digest('hex');
}

@Injectable()
export class PayUService {
  constructor(
    private donationRepository: DonationRepository,
    private donationService: DonationService,
  ) {}

  async getHash(body) {
    try {
      const { donor_firstName, donor_phone, amount, donor_email, txnid } = body;
      console.log(body);

      const apiEndpoint = process.env?.PAYU_TEST_ENDPOINT;

      // Set the merchant key and salt
      const merchantKey = process.env?.PAYU_API_KEY;
      const salt = process.env?.PAYU_API_SALT;

      // Set the order details
      const surl = 'http://localhost:3001/payu/success';
      const furl = 'http://localhost:3001/payu/failed';

      // Create a map of parameters to pass to the PayU API
      const pd = {
        key: merchantKey,
        txnid: txnid,
        amount: amount,
        productinfo: 'TestProduct',
        firstname: donor_firstName,
        email: donor_email,
        phone: donor_phone,
        surl: surl,
        furl: furl,
      };

      // Generate the hash
      const hash = generateHash(pd, salt);
      console.log(hash);

      return { message: 'Transaction Initialized', data: { hash: hash } };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async success(body) {
    const donation = await this.donationRepository.getOneDonation({ where: { reference_payment: body?.txnid }, relations: ['fundraiser'] });

    if (!donation) {
      throw new NotFoundException('Donation with this order_id does not exist');
    }

    await this.donationRepository.UpdateOneDonation(donation?.donation_id, {
      payment_status: 'success',
    });
  }
}
