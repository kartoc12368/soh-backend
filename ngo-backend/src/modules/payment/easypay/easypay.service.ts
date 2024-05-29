import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';

@Injectable()
export class EasypayService {
  private merchantId: string;
  private encryptionKey: string;
  private subMerchantId: string;
  private paymode: string;
  private returnUrl: string;

  constructor() {
    this.merchantId = 'XXXXXX';
    this.encryptionKey = '1000060000000000';
    this.subMerchantId = 'XX';
    this.paymode = 'X';
    this.returnUrl = 'https://example.com/some_file_name.php';
  }

  async redirectUrl(res, body) {
    try {
      const amount = String(body?.amount) || '100';

      // Include the payment processing logic
      const reference_no = Math.floor(Math.random() * 1000000);
      const payment_url = await this.getPaymentUrl(amount, String(reference_no), null);
      console.log('payment_url:' + payment_url);

      // Redirect the user to the payment URL
      // res.redirect(payment_url);
      return payment_url;
    } catch (error) {
      await new ErrorResponseUtility();
    }
  }

  async getPaymentUrl(amount, referenceNo, optionalField = null) {
    try {
      const mandatoryField = await this.getMandatoryField(amount, referenceNo);
      console.log(mandatoryField);
      const optionalFieldValue = await this.getOptionalField(optionalField);
      console.log('optionalFieldValue: ' + optionalFieldValue);

      const amountValue = await this.getAmount(amount);
      console.log('amountValue: ' + amountValue);
      const referenceNoValue = await this.getReferenceNo(referenceNo);
      console.log('referenceNoValue: ' + referenceNoValue);

      const paymentUrl = await this.generatePaymentUrl(mandatoryField, optionalFieldValue, amountValue, referenceNoValue);
      return paymentUrl;
    } catch (error) {
      await new ErrorResponseUtility();
    }
  }

  async generatePaymentUrl(mandatoryField, optionalField, amount, referenceNo) {
    try {
      const encryptedUrl = `https://eazypay.icicibank.com/EazyPG?merchantid=${
        this.merchantId
      }&mandatory fields=${mandatoryField}&optional fields=${optionalField}&returnurl=${this.getReturnUrl()}&Reference No=${referenceNo}&submerchantid=${this.getSubMerchantId()}&transaction amount=${amount}&paymode=${this.getPaymode()}`;
      return encryptedUrl;
    } catch (error) {
      await new ErrorResponseUtility();
    }
  }

  async getMandatoryField(amount, referenceNo) {
    try {
      return await this.getEncryptValue(`${referenceNo}|${this.subMerchantId}|${amount}`);
    } catch (error) {
      await new ErrorResponseUtility();
    }
  }

  async getOptionalField(optionalField = null) {
    try {
      if (optionalField !== null) {
        return this.getEncryptValue(optionalField);
      }
      return null;
    } catch (error) {
      await new ErrorResponseUtility();
    }
  }

  async getAmount(amount) {
    try {
      return this.getEncryptValue(amount);
    } catch (error) {
      await new ErrorResponseUtility();
    }
  }

  async getReturnUrl() {
    try {
      return this.getEncryptValue(this.returnUrl);
    } catch (error) {
      await new ErrorResponseUtility();
    }
  }

  async getReferenceNo(referenceNo) {
    try {
      return this.getEncryptValue(referenceNo);
    } catch (error) {
      await new ErrorResponseUtility();
    }
  }

  async getSubMerchantId() {
    try {
      return this.getEncryptValue(this.subMerchantId);
    } catch (error) {
      await new ErrorResponseUtility();
    }
  }

  async getPaymode() {
    try {
      return this.getEncryptValue(this.paymode);
    } catch (error) {
      await new ErrorResponseUtility();
    }
  }

  async getEncryptValue(data) {
    try {
      const encrypted = await this.encrypt(data, this.encryptionKey);
      return btoa(encrypted);
    } catch (error) {
      await new ErrorResponseUtility();
    }
  }

  async encrypt(data, key) {
    try {
      const cipher = crypto.createCipheriv('aes-128-ecb', key, null);
      let encrypted = cipher.update(data, 'utf8', 'binary');
      encrypted += cipher.final('binary');
      return encrypted;
    } catch (error) {
      await new ErrorResponseUtility();
    }
  }
}
