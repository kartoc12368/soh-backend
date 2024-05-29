import { Injectable } from '@nestjs/common';
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
      const { name, number, amount, donor_email } = body;
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
        txnid: 'TXN' + Date.now(),
        amount: amount,
        productinfo: 'TestProduct',
        firstname: name,
        email: donor_email,
        phone: number,
        surl: surl,
        furl: furl,
      };

      // Generate the hash
      const hash = generateHash(pd, salt);
      console.log(hash);

      const formData = new URLSearchParams();
      formData.append('key', pd.key);
      formData.append('txnid', pd.txnid);
      formData.append('amount', pd.amount);
      formData.append('productinfo', pd.productinfo);
      formData.append('firstname', pd.firstname);
      formData.append('email', pd.email);
      formData.append('phone', pd.phone);
      formData.append('surl', pd.surl);
      formData.append('furl', pd.furl);
      formData.append('hash', hash);
      console.log(formData, 'he');

      try {
        const result = await axios.post('https://secure.payu.in/_payment', pd, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        console.log(result.request.res.responseUrlm, 'link');
      } catch (err) {
        console.log('error', err);
      }

      return { message: 'Transaction Initialized', data: { hash: hash, transactionId: pd.txnid } };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
