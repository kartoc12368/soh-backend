import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

import { DonationRepository } from 'src/modules/donation/donation.repository';

import { SendEmailDto } from 'src/shared/interface/mail.interface';
import EasyPayCodes from 'src/shared/utility/easypay-error.utility';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';
import { SendMailerUtility } from 'src/shared/utility/send-mailer.utility';

@Injectable()
export class PaymentService {
  private merchantId: string;
  private encryptionKey: string;
  private subMerchantId: string;
  private paymode: string;
  private returnUrl: string;

  constructor(
    private readonly donationRepository: DonationRepository,
    private readonly mailerService: MailerService,
  ) {
    this.merchantId = process.env?.EASYPAY_MERCHANT_ID;
    this.encryptionKey = process.env?.EASYPAY_AESKEY;
    this.subMerchantId = process.env?.EASYPAY_SUBMID;
    this.paymode = process.env?.EASYPAY_PAYMODE;
    this.returnUrl = process.env?.EASYPAY_RETURNURL;
  }

  async redirectUrl(res, body) {
    try {
      const { donor_phone, donor_email, donor_address, donor_first_name, pan, amount } = body;

      // Include the payment processing logic
      const { reference_payment } = await this.donationRepository.getOneDonation({ where: { donor_phone: donor_phone, payment_status: 'pending' }, select: ['reference_payment'], order: { donation_id_frontend: 'DESC' } });

      const payment_url = await this.getPaymentUrl(String(amount), reference_payment, donor_phone, donor_email, donor_first_name, donor_address, pan);

      // Redirect the user to the payment URL
      // res.redirect(payment_url);
      return { url: payment_url };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async verify(body, response) {
    console.log(body);
    if (Object.keys(body).length !== 0 && body['Total Amount'] && body['Response Code'] === 'E000') {
      // Same encryption key that we gave for generating the URL
      const aesKeyForPaymentSuccess = process.env?.EASYPAY_AESKEY;

      const verificationKey = `${body.ID}|${body['Response Code']}|${body['Unique Ref Number']}|${body['Service Tax Amount']}|${body['Processing Fee Amount']}|${body['Total Amount']}|${body['Transaction Amount']}|${body['Transaction Date']}|${body['Interchange Value']}|${body.TDR}|${body['Payment Mode']}|${body.SubMerchantId}|${body.ReferenceNo}|${body.TPS}|${aesKeyForPaymentSuccess}`;

      const encryptedMessage = crypto.createHash('sha512').update(verificationKey).digest('hex');

      if (encryptedMessage === body.RS) {
        const donation = await this.donationRepository.getOneDonation({ where: { reference_payment: body['ReferenceNo'] } });

        await this.donationRepository.UpdateOneDonation(donation?.donation_id, {
          payment_status: 'success',
          payment_details: body,
          payment_info: EasyPayCodes(body['Response Code']),
          payment_method: body['Payment Mode'],
        });

        const sendEmailDto: SendEmailDto = {
          firstName: donation?.donor_first_name,
          recipients: [{ name: 'Support Our Heroes', address: `${process.env?.MAIL_USER}` }],
          data: donation,
          payment_info: { payment_info: EasyPayCodes(body['Response Code']), payment_method: body['Payment Mode'] },
        };

        await new SendMailerUtility(this.mailerService).transactionSuccess(sendEmailDto);

        response.redirect(`${process.env?.FRONTEND_URL}/thank-you/${body['ReferenceNo']}`);
      } else {
        const donation = await this.donationRepository.getOneDonation({ where: { reference_payment: body['ReferenceNo'] } });

        await this.donationRepository.UpdateOneDonation(donation?.donation_id, {
          payment_status: 'failed',
          payment_details: body,
          payment_info: EasyPayCodes(body['Response Code']),
          payment_method: body['Payment Mode'],
        });

        const sendEmailDto: SendEmailDto = {
          firstName: donation?.donor_first_name,
          recipients: [{ name: 'Support Our Heroes', address: `${process.env?.MAIL_USER}` }],
          data: donation,
          payment_info: { payment_info: EasyPayCodes(body['Response Code']), payment_method: body['Payment Mode'] },
        };

        await new SendMailerUtility(this.mailerService).transactionFailed(sendEmailDto);

        response.redirect(`${process.env?.FRONTEND_URL}/donation-fail/${body['ReferenceNo']}`);
      }
    } else {
      const donation = await this.donationRepository.getOneDonation({ where: { reference_payment: body['ReferenceNo'] } });

      await this.donationRepository.UpdateOneDonation(donation?.donation_id, {
        payment_status: 'failed',
        payment_details: body,
        payment_info: EasyPayCodes(body['Response Code']),
        payment_method: body['Payment Mode'],
      });

      const sendEmailDto: SendEmailDto = {
        firstName: donation?.donor_first_name,
        recipients: [{ name: 'Support Our Heroes', address: `${process.env?.MAIL_USER}` }],
        data: donation,
        payment_info: { payment_info: EasyPayCodes(body['Response Code']), payment_method: body['Payment Mode'] },
      };

      if (body['Response Code'] === 'E00335') {
        await new SendMailerUtility(this.mailerService).transactionCancelled(sendEmailDto);
        response.redirect(`${process.env?.FRONTEND_URL}/summary`);
      } else {
        await new SendMailerUtility(this.mailerService).transactionFailed(sendEmailDto);

        response.redirect(`${process.env?.FRONTEND_URL}/donation-fail/${body['ReferenceNo']}`);
      }
    }
  }
  async getPaymentUrl(amount, referenceNo, mobileNumber, email, donor_first_name, donor_address, pan) {
    try {
      const mandatoryField = await this.getMandatoryField(amount, referenceNo, donor_first_name);
      const optionalFieldValue = await this.getOptionalField(pan, email, mobileNumber, donor_address);

      const amountValue = await this.getAmount(amount);
      const referenceNoValue = await this.getReferenceNo(referenceNo);

      const paymentUrl = await this.generatePaymentUrl(mandatoryField, optionalFieldValue, amountValue, referenceNoValue);
      return paymentUrl;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async generatePaymentUrl(mandatoryField, optionalField, amount, referenceNo) {
    try {
      const encryptedUrl = `${process.env?.EASYPAY_URL}?merchantid=${
        this.merchantId
      }&mandatory fields=${mandatoryField}&optional fields=${optionalField}&returnurl=${await this.getReturnUrl()}&Reference No=${referenceNo}&submerchantid=${await this.getSubMerchantId()}&transaction amount=${amount}&paymode=${await this.getPaymode()}`;
      console.log(encryptedUrl, 'h');
      return encryptedUrl;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getMandatoryField(amount, referenceNo, donor_first_name) {
    try {
      return await this.getEncryptValue(`${referenceNo}|${this.subMerchantId}|${amount}|${donor_first_name}`);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getOptionalField(pan, email, mobileNumber, donor_address) {
    try {
      if (pan == undefined) {
        pan = '';
      }
      if (email == undefined) {
        email = '';
      }
      if (donor_address == undefined) {
        donor_address = ' ';
      }

      return await this.getEncryptValue(`${pan}|${email}|${mobileNumber}|${donor_address}`);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getAmount(amount) {
    try {
      return await this.getEncryptValue(amount);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getReturnUrl() {
    try {
      return await this.getEncryptValue(this.returnUrl);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getReferenceNo(referenceNo) {
    try {
      return await this.getEncryptValue(referenceNo);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getSubMerchantId() {
    try {
      return await this.getEncryptValue(this.subMerchantId);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getPaymode() {
    try {
      return await this.getEncryptValue(this.paymode);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getEncryptValue(data) {
    try {
      console.log(data);
      const encrypted = await this.encrypt(data, this.encryptionKey);
      return btoa(encrypted);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async encrypt(data, key) {
    try {
      const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
      let encrypted = cipher.update(data, 'utf8', 'binary');
      encrypted += cipher.final('binary');
      return encrypted;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async findPendingPayment() {
    const donations = await this.donationRepository.getAllDonations({ where: { payment_status: 'pending' } });
    if (donations.length) {
      const sendEmailDto: SendEmailDto = {
        recipients: [{ name: 'Support Our Heroes', address: `${process.env?.MAIL_USER}` }],
        data: donations,
        payment_info: { payment_info: 'Payment Window Closed by User' },
      };

      await new SendMailerUtility(this.mailerService).transactionClosed(sendEmailDto);
    }
    donations.forEach(async (donation) => {
      await this.donationRepository.UpdateOneDonation(donation?.donation_id, { payment_status: 'failed', payment_info: 'Payment Window closed by User' });
    });
  }
}
