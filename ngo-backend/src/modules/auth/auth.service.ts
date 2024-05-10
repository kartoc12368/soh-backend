import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ForgottenPassword } from 'src/shared/entity/forgot-password.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { MailerService } from 'src/shared/utility/mailer/mailer.service';
import { FundraiserService } from '../fundraiser/fundraiser.service';

import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { ForgottenPasswordRepository } from './forgot-password.repository';

import { sendEmailDto } from 'src/shared/utility/mailer/mail.interface';

import * as bcrypt from 'bcrypt';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';

@Injectable()
export class AuthService {
  constructor(
    private forgottenPasswordRepository: ForgottenPasswordRepository,
    private fundraiserRepository: FundRaiserRepository,

    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async login(user, loginDto): Promise<ResponseStructure> {
    try {
      //jwt token
      const fundraiser: Fundraiser = user;

      const fundraiserStatus = await this.fundraiserRepository.getFundRaiserStatusByEmail(fundraiser?.email);
      if (!fundraiserStatus) {
        throw new NotFoundException('Fundraiser not found');
      }

      if ((fundraiser?.role == 'FUNDRAISER' && fundraiserStatus == 'active') || fundraiser?.role == 'ADMIN') {
        const userPassword = await this.fundraiserRepository.getFundraiser({ where: { email: fundraiser.email }, select: ['password'] });

        if (fundraiser && (await bcrypt?.compare(loginDto?.password, userPassword?.password))) {
          const payload = {
            firstName: fundraiser?.firstName,
            email: fundraiser?.email,
            role: fundraiser?.role,
            fundraiserId: fundraiser?.fundraiser_id,
            profileImage: fundraiser?.profileImage,
          };

          return { message: 'Login Successful', data: { token: this.jwtService.sign(payload) } };
        } else {
          throw new UnauthorizedException('Invalid Password');
        }
      } else {
        throw new UnauthorizedException('Please Sign Up');
      }
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async sendEmailForgotPassword(email: string): Promise<ResponseStructure> {
    try {
      const user = await this.fundraiserRepository.findFundRaiserByEmail(email);

      if (!user) {
        throw new NotFoundException('Fundraiser not found');
      }

      var randomstring = Math?.random()?.toString(36)?.slice(-8);

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

      await this.forgottenPasswordRepository.createForgottenPassword(email, randomstring);

      setTimeout(async () => {
        try {
          var user2 = await this.forgottenPasswordRepository.getOtp({ where: { email: email } });

          await this.forgottenPasswordRepository.deleteOtp(user2);
        } catch {
          return true;
        }
      }, 600000);

      return { message: 'Email Sent successfully', success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async setNewPassword(body): Promise<ResponseStructure> {
    try {
      var fundraiser = await this.forgottenPasswordRepository.getOtp({ where: { newPasswordToken: body.otp } });

      if (!fundraiser) {
        throw new NotFoundException('Invalid Otp');
      }

      var user_new = await this.fundraiserRepository.findFundRaiserByEmail(fundraiser.email);

      const password = body.newPassword;

      const hashedPassword = await bcrypt.hash(password, 10);

      var status = await this.fundraiserRepository.UpdateFundraiser(user_new.fundraiser_id, { password: hashedPassword });

      if (status) {
        await this.forgottenPasswordRepository.deleteOtp(fundraiser);
      }

      return { message: 'Password Reset Successfully' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
