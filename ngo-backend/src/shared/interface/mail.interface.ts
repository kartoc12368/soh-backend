import { Address } from 'nodemailer/lib/mailer';

export type sendEmailDto = {
  recipients: Address[];
};
