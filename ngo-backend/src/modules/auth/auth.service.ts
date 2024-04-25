import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ForgottenPassword } from 'src/shared/entity/forgot-password.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { MailerService } from 'src/shared/utility/mailer/mailer.service';
import { FundraiserService } from '../fundraiser/fundraiser.service';

import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { ForgottenPasswordRepository } from './forgot-password.repository';

import { sendEmailDto } from 'src/shared/utility/mailer/mail.interface';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private mailerService: MailerService,
    private forgottenPasswordRepository: ForgottenPasswordRepository,
    private fundraiserService: FundraiserService,
    private fundraiserRepository: FundRaiserRepository,
    private jwtService: JwtService,
  ) { }

  async login(user, loginDto) {
    try {
      //jwt token
      const fundraiser: Fundraiser = user;
      if ((fundraiser.role == 'FUNDRAISER' && (await this.fundraiserService.getFundRaiserStatusByEmail(fundraiser.email)) == 'active') || fundraiser.role == 'ADMIN') {
        const userPassword = await this.fundraiserRepository.findOne({ where: { email: fundraiser.email }, select: ['password'] });

        if (fundraiser && (await bcrypt.compare(loginDto.password, userPassword.password))) {

          const payload = {
            firstName: fundraiser.firstName,
            email: fundraiser.email,
            role: fundraiser.role,
            fundraiserId: fundraiser.fundraiser_id,
            profileImage: fundraiser.profileImage,
          };

          return { token: this.jwtService.sign(payload) };
          // return this.authService.issueTokens(user, response); // Issue tokens on login
        } else {
          return null;
        }

      } else {
        return 'Please contact the administrator';
      }
    } catch (error) {
      console.log(error);
    }
  }

  async sendEmailForgotPassword(email: string) {
    try {
      const user = await this.fundraiserService.findFundRaiserByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      var randomstring = Math.random().toString(36).slice(-8);

      var body2 = {
        firstName: user.firstName,
        otp: randomstring,
      };

      const dto: sendEmailDto = {
        recipients: [{ name: user.firstName, address: user.email }],
        subject: 'Reset Password',
        html: '<p>Hi {firstName}, Reset password using:{otp} </p><p>Otp expires in<strong>10</strong>minutes</p>',
        placeholderReplacements: body2,
      };

      await this.mailerService.sendMail(dto);

      let forgotPassword = new ForgottenPassword();

      forgotPassword.email = email;

      forgotPassword.newPasswordToken = randomstring;

      await this.forgottenPasswordRepository.save(forgotPassword);

      setTimeout(async () => {
        try {
          var user2 = await this.forgottenPasswordRepository.findOne({ where: { email: email } });

          await this.forgottenPasswordRepository.remove(user2);
        } catch {
          return true;
        }
      }, 600000);

      return 'true';

    } catch (error) {
      console.log(error);
    }
  }

  async setNewPassword(body) {
    try {
      var fundraiser = await this.forgottenPasswordRepository.findOne({ where: { newPasswordToken: body.otp } });
      if (!fundraiser) {
        throw new NotFoundException('Invalid Otp');
      } else {
        var user_new = await this.fundraiserService.findFundRaiserByEmail(fundraiser.email);

        const password = body.newPassword;

        const hashedPassword = await bcrypt.hash(password, 10);

        var status = await this.fundraiserRepository.update(user_new.fundraiser_id, { password: hashedPassword });

        if (status) {
          await this.forgottenPasswordRepository.remove(fundraiser);
        }
        return 'Success';
      }
    } catch (error) {
      console.log(error);
    }
  }
}
