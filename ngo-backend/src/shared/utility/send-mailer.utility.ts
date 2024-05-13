import { MailerService } from '@nestjs-modules/mailer';
import { sendEmailDto } from '../interface/mail.interface';
import { sendPassword } from '../email_templates/password.html';
import { resetPassword } from '../email_templates/reset-password.html';

export class SendMailerUtility {
  constructor(private readonly mailerService: MailerService) {}

  async generatePassword(dto, data) {
    const { recipients } = dto;
    await this.mailerService.sendMail({
      subject: `Support Our Heroes - Fundraiser Password`,
      to: recipients,
      html: await sendPassword(data),
    });
  }

  async resetPassword(dto, data) {
    const { recipients } = dto;
    await this.mailerService.sendMail({
      subject: `Support Our Heroes - Reset Password`,
      to: recipients,
      html: await resetPassword(data),
    });
  }
}
