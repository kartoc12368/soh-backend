import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';

@Injectable()
export class EasypayService {
  private merchantId: string;
  private encryptionKey: string;
  private subMerchantId: number;
  private paymode: string;
  private returnUrl: string;

  constructor() {
    this.merchantId = '100011';
    this.encryptionKey = '1000060000000000';
    this.subMerchantId = 1234;
    this.paymode = '9';
    this.returnUrl = 'https://merchant.url/return.aspx';
  }

  async redirectUrl(res, body) {
    try {
      const amount = String(body?.amount) || '200';

      // Include the payment processing logic
      const reference_no = Math.floor(Math.random() * 1000000);
      const payment_url = await this.getPaymentUrl(amount, String(reference_no), null);
      console.log('payment_url:' + payment_url);

      // Redirect the user to the payment URL
      // res.redirect(payment_url);
      return payment_url;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async verify(body) {
    if (Object.keys(body).length !== 0 && body.Total_Amount && body.Response_Code === 'E000') {
      const res = body;

      // Same encryption key that we gave for generating the URL
      const aesKeyForPaymentSuccess = 'XXXXXXXXXXXXXXXX';

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

      const verificationKey = `${data.ID}|${data.Response_Code}|${data.Unique_Ref_Number}|${data.Service_Tax_Amount}|${data.Processing_Fee_Amount}|${data.Total_Amount}|${data.Transaction_Amount}|${data.Transaction_Date}|${data.Interchange_Value}|${data.TDR}|${data.Payment_Mode}|${data.SubMerchantId}|${data.ReferenceNo}|${data.TPS}|${aesKeyForPaymentSuccess}`;

      const encryptedMessage = crypto.createHash('sha512').update(verificationKey).digest('hex');
      if (encryptedMessage === data.RS) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
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
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async generatePaymentUrl(mandatoryField, optionalField, amount, referenceNo) {
    try {
      const encryptedUrl = `https://eazypay.icicibank.com/EazyPG?merchantid=${
        this.merchantId
      }&mandatoryfields=${mandatoryField}&optionalfields=${optionalField}&returnurl=${await this.getReturnUrl()}&ReferenceNo=${referenceNo}&submerchantid=${await this.getSubMerchantId()}&transactionamount=${amount}&paymode=${await this.getPaymode()}`;
      return encryptedUrl;
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getMandatoryField(amount, referenceNo) {
    try {
      return await this.getEncryptValue(`${referenceNo}|${this.subMerchantId}|${amount}`);
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async getOptionalField(optionalField = null) {
    try {
      if (optionalField !== null) {
        return await this.getEncryptValue(optionalField);
      }
      return null;
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
