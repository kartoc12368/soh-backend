import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { ForgottenPasswordRepository } from './forgot-password.repository';

import { sendEmailDto } from 'src/shared/interface/mail.interface';

import * as bcrypt from 'bcrypt';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailerUtility } from 'src/shared/utility/send-mailer.utility';

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

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser not found');
      }

      const fundraiserStatus = await this.fundraiserRepository.getFundRaiserStatusByEmail(fundraiser?.email);

      if (!fundraiserStatus) {
        throw new NotFoundException('Fundraiser status not found');
      }
      console.log(fundraiser, 'h');
      if ((fundraiser?.role == 'FUNDRAISER' && fundraiserStatus == 'active') || fundraiser?.role == 'ADMIN') {
        console.log(fundraiser);
        const userPassword = await this.fundraiserRepository.getFundraiser({ where: { email: fundraiser?.email }, select: ['password'] });

        if (fundraiser && (await bcrypt.compare(loginDto?.password, userPassword?.password))) {
          console.log(fundraiser);
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
      const fundraiser = await this.fundraiserRepository.findFundRaiserByEmail(email);

      if (!fundraiser) {
        throw new NotFoundException('Fundraiser not found');
      }

      const randomstring = Math?.random()?.toString(36)?.slice(-8);

      const body2 = {
        firstName: fundraiser?.firstName,
        otp: randomstring,
      };

      const dto = {
        recipients: [{ name: fundraiser?.firstName, address: fundraiser?.email }],
      };

      await new SendMailerUtility(this.mailerService).resetPassword(dto, body2);

      await this.forgottenPasswordRepository.createForgottenPassword(email, randomstring);

      setTimeout(async () => {
        try {
          const user2 = await this.forgottenPasswordRepository.getOtp({ where: { email: email } });

          if (!user2) {
            throw new NotFoundException('Otp Not Found for user');
          }

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
      const fundraiser = await this.forgottenPasswordRepository.getOtp({ where: { newPasswordToken: body?.otp } });

      if (!fundraiser) {
        throw new NotFoundException('Invalid Otp');
      }

      const user_new = await this.fundraiserRepository.findFundRaiserByEmail(fundraiser?.email);

      if (!user_new) {
        throw new NotFoundException('Fundraiser not found');
      }

      const password = body?.newPassword;

      const hashedPassword = await bcrypt?.hash(password, 10);

      const status = await this.fundraiserRepository.UpdateFundraiser(user_new?.fundraiser_id, { password: hashedPassword });

      if (status) {
        await this.forgottenPasswordRepository.deleteOtp(fundraiser);
      }

      return { message: 'Password Reset Successfully' };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }
}
