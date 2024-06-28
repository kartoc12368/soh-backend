import { Address } from 'nodemailer/lib/mailer';

export type SendEmailDto = {
  firstName?: string;
  password?: string;
  recipients: Address[];
  otp?: string;
  data?: object;
  payment_info?: object;
};
