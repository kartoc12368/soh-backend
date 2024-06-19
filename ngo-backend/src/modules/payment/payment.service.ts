import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

import { DonationRepository } from 'src/modules/donation/donation.repository';

import { SendEmailDto } from 'src/shared/interface/mail.interface';
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
    private donationRepository: DonationRepository,
    private readonly mailerService: MailerService,
  ) {
    // this.merchantId = process.env?.EASYPAY_MERCHANT_ID;
    this.merchantId = process.env?.EASYPAY_MERCHANT_ID_UAT;
    this.encryptionKey = process.env?.EASYPAY_AESKEY_UAT;
    this.subMerchantId = process.env?.EASYPAY_SUBMID;
    this.paymode = process.env?.EASYPAY_PAYMODE;
    this.returnUrl = process.env?.EASYPAY_RETURNURL;
  }

  async redirectUrl(res, body) {
    console.log(body);
    try {
      const amount = body?.amount;

      const { donor_phone, donor_email, donor_address, donor_first_name, pan } = body;

      // Include the payment processing logic
      const reference_no = Math.floor(Math.random() * 1000000);
      const payment_url = await this.getPaymentUrl(amount, String(reference_no), donor_phone, donor_email, donor_first_name, donor_address, pan);
      console.log('payment_url:' + payment_url);

      // Redirect the user to the payment URL
      // res.redirect(payment_url);
      return { url: payment_url };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async verify(body) {
    if (Object.keys(body).length !== 0 && body['Total Amount'] && body['Response Code'] === 'E000') {
      const res = body;

      // Same encryption key that we gave for generating the URL
      const aesKeyForPaymentSuccess = process.env?.EASYPAY_AESKEY_UAT;

      const data = {
        Response_Code: res.Response_Code,
        Unique_Ref_Number: res.Unique_Ref_Number,
        Service_Tax_Amount: res.Service_Tax_Amount,
        Processing_Fee_Amount: res.Processing_Fee_Amount,
        Total_Amount: res.Total_Amount,
        Transaction_Amount: res.Transaction_Amount,
        Transaction_Date: res.Transaction_Date,
        Interchange_Value: res.Interchange_Value,
        TDR: res.TDR,
        Payment_Mode: res.Payment_Mode,
        SubMerchantId: res.SubMerchantId,
        ReferenceNo: res.ReferenceNo,
        ID: res.ID,
        RS: res.RS,
        TPS: res.TPS,
      };

      const verificationKey = `${body.ID}|${body['Response Code']}|${body['Unique Ref Number']}|${body['Service Tax Amount']}|${body['Processing Fee Amount']}|${body['Total Amount']}|${body['Transaction Amount']}|${body['Transaction Date']}|${body['Interchange Value']}|${body.TDR}|${body['Payment Mode']}|${body.SubMerchantId}|${body.ReferenceNo}|${body.TPS}|${aesKeyForPaymentSuccess}`;

      const encryptedMessage = crypto.createHash('sha512').update(verificationKey).digest('hex');
      console.log(encryptedMessage);
      if (encryptedMessage === data.RS) {
        const donation = await this.donationRepository.getOneDonation({ where: { reference: data?.Unique_Ref_Number } });

        await this.donationRepository.UpdateOneDonation(donation?.donation_id, {
          payment_status: 'success',
        });

        const sendEmailDto: SendEmailDto = {
          firstName: donation?.donor_first_name,
          recipients: [{ name: donation?.donor_first_name, address: donation?.donor_email }],
          data: donation,
        };

        await new SendMailerUtility(this.mailerService).transactionSuccess(sendEmailDto);

        res.status(201).location('http://localhost:3000/thank-you').json(donation);
      } else {
        res.status(401).location('http://localhost:3000/donation-fail').json({});
      }
    } else {
      return body;
      // return false;
    }
  }
  async getPaymentUrl(amount, referenceNo, mobileNumber, email, donor_first_name, donor_address, pan) {
    try {
      const mandatoryField = await this.getMandatoryField(amount, referenceNo, donor_first_name, donor_address);
      console.log(mandatoryField);
      const optionalFieldValue = await this.getOptionalField(pan, email, mobileNumber);
      console.log('optionalFieldValue: ' + optionalFieldValue);

      const amountValue = await this.getAmount(amount);
      console.log('amountValue: ' + amountValue);
      const referenceNoValue = await this.getReferenceNo(referenceNo);
      console.log('referenceNoValue: ' + referenceNoValue);

      const paymentUrl = await this.generatePaymentUrl(mandatoryField, optionalFieldValue, amount, referenceNo, email, mobileNumber, donor_first_name, donor_address, pan);
      return paymentUrl;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async generatePaymentUrl(mandatoryField, optionalField, amount, referenceNo, email, mobileNumber, donor_first_name, donor_address, pan) {
    try {
      const url = `${process.env?.EASYPAY_URL_UAT}?merchantid=${this.merchantId}&mandatory fields=${referenceNo}|${this.subMerchantId}|${amount}|${donor_first_name}|${donor_address}&optional fields=${pan}|${email}|${mobileNumber}&returnurl=${this.returnUrl}&Reference No=${referenceNo}&submerchantid=${this.subMerchantId}&transaction amount=${amount}&paymode=${this.paymode}`;
      console.log('unencrypted', url);
      const encryptedUrl = `${process.env?.EASYPAY_URL_UAT}?merchantid=${
        this.merchantId
      }&mandatory fields=${mandatoryField}&optional fields=${optionalField}&returnurl=${await this.getReturnUrl()}&Reference No=${await this.getReferenceNo(referenceNo)}&submerchantid=${await this.getSubMerchantId()}&transaction amount=${await this.getAmount(amount)}&paymode=${await this.getPaymode()}`;
      return encryptedUrl;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async pushUrl(body) {
    try {
      console.log(body);
      return 'Success';
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getMandatoryField(amount, referenceNo, donor_first_name, donor_address) {
    try {
      return await this.getEncryptValue(`${referenceNo}|${this.subMerchantId}|${amount}|${donor_first_name}|${donor_address}`);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getOptionalField(pan, email, mobileNumber) {
    try {
      return await this.getEncryptValue(`${pan}|${email}|${mobileNumber}`);
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
}
