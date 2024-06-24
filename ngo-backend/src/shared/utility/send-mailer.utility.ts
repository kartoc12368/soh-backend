import { MailerService } from '@nestjs-modules/mailer';

import { sendPassword } from '../email_templates/password.html';
import { resetPassword } from '../email_templates/reset-password.html';
import { failedTransaction } from '../email_templates/failed-transaction.html';
import { successTransaction } from '../email_templates/success-transaction.html';
import { getFormattedDate } from './date.utility';

export class SendMailerUtility {
  constructor(private readonly mailerService: MailerService) {}

  async generatePassword(data) {
    const { recipients } = data;
    await this.mailerService.sendMail({
      subject: `Support Our Heroes - Fundraiser Password`,
      to: recipients,
      html: await sendPassword(data),
    });
  }

  async resetPassword(data) {
    const { recipients } = data;
    await this.mailerService.sendMail({
      subject: `Support Our Heroes - Reset Password`,
      to: recipients,
      html: await resetPassword(data),
    });
  }

  async transactionSuccess(data) {
    const { recipients } = data;
    await this.mailerService.sendMail({
      subject: `Donation Transaction Success - ${await getFormattedDate(data?.data?.created_at)}`,
      to: recipients,
      html: await successTransaction(data?.data),
    });
  }

  async transactionFailed(data) {
    const { recipients } = data;
    await this.mailerService.sendMail({
      subject: `Donation Transaction Failed - ${await getFormattedDate(data?.data?.created_at)}`,
      to: recipients,
      html: await failedTransaction(data?.data),
    });
  }
}
