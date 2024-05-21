import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { ForgottenPasswordRepository } from './forgot-password.repository';

import { SendEmailDto } from 'src/shared/interface/mail.interface';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';

import { ErrorResponseUtility } from 'src/shared/utility/error-response.utility';
import { SendMailerUtility } from 'src/shared/utility/send-mailer.utility';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly forgottenPasswordRepository: ForgottenPasswordRepository,
    private readonly fundraiserRepository: FundRaiserRepository,

    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
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

      if ((fundraiser?.role == 'FUNDRAISER' && fundraiserStatus == 'active') || fundraiser?.role == 'ADMIN') {
        const userPassword = await this.fundraiserRepository.getFundraiser({ where: { email: fundraiser?.email }, select: ['password'] });

        if (fundraiser && (await bcrypt.compare(loginDto?.password, userPassword?.password))) {
          const payload = {
            firstName: fundraiser?.firstName,
            email: fundraiser?.email,
            role: fundraiser?.role,
            fundraiserId: fundraiser?.fundraiser_id,
            profileImage: fundraiser?.profileImage,
          };

          return this.issueTokens(user); // Issue tokens on login
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

      const otpExists = await this.forgottenPasswordRepository.getFundraiserByOtp({ where: { email: email } });

      if (otpExists) {
        return { message: 'Email Already Sent', success: true };
      }

      const OTP = Math?.random()?.toString(36)?.slice(-8);

      const sendEmailDto: SendEmailDto = {
        firstName: fundraiser?.firstName,
        otp: OTP,
        recipients: [{ name: fundraiser?.firstName, address: fundraiser?.email }],
      };

      await new SendMailerUtility(this.mailerService).resetPassword(sendEmailDto);

      await this.forgottenPasswordRepository.createForgottenPassword(email, OTP);

      return { message: 'Email Sent successfully', success: true };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async setNewPassword(body): Promise<ResponseStructure> {
    try {
      const fundraiser = await this.forgottenPasswordRepository.getFundraiserByOtp({ where: { newPasswordToken: body?.otp } });

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

  async refreshToken(refreshToken): Promise<ResponseStructure> {
    try {
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      const fundraiser = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const payload = {
        firstName: fundraiser.firstName,
        email: fundraiser.email,
        role: fundraiser.role,
        fundraiserId: fundraiser.fundraiserId,
        profileImage: fundraiser.profileImage,
      };

      const userExists = await this.fundraiserRepository.findOne({
        where: { fundraiser_id: payload.fundraiserId },
      });

      if (!userExists) {
        throw new BadRequestException('User no longer exists');
      }

      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '15min',
      });

      return { message: 'Access Token successfully updated', data: { token: accessToken } };
    } catch (error) {
      await ErrorResponseUtility.errorResponse(error);
    }
  }

  async issueTokens(fundraiser: Fundraiser): Promise<ResponseStructure> {
    const payload = {
      firstName: fundraiser.firstName,
      email: fundraiser.email,
      role: fundraiser.role,
      fundraiserId: fundraiser.fundraiser_id,
      profileImage: fundraiser.profileImage,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: '15min',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });

    return { message: 'Login Successful', data: { token: accessToken, refreshToken: refreshToken } };
  }

  async deleteExpiredOtp() {
    try {
      const otpHistory = await this.forgottenPasswordRepository.getAllOtp();

      otpHistory.forEach(async (otp) => {
        var dateUTC = new Date(otp.created_at).getTime();
        var dateIST = new Date(dateUTC);
        //date shifting for IST timezone (+5 hours and 30 minutes)
        dateIST.setHours(dateIST.getHours() + 5);
        dateIST.setMinutes(dateIST.getMinutes() + 45);
        console.log(dateIST.toLocaleString());
        if (dateIST.toLocaleString() < new Date().toLocaleString()) {
          await this.forgottenPasswordRepository.deleteOtp(otp);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
}
