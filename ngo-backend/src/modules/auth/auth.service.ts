import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ForgottenPassword } from 'src/shared/entity/forgot-password.entity';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';

import { MailerService } from 'src/shared/utility/mailer/mailer.service';
import { FundraiserService } from '../fundraiser/fundraiser.service';

import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { ForgottenPasswordRepository } from './forgot-password.repository';

import { sendEmailDto } from 'src/shared/utility/mailer/mail.interface';

import * as bcrypt from "bcrypt";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

  constructor(
    private mailerService: MailerService,
    private forgottenPasswordRepository: ForgottenPasswordRepository,
    private fundraiserService: FundraiserService,
    private fundraiserRepository: FundRaiserRepository,
    private jwtService: JwtService,
    private configService: ConfigService

  ) { }

  async login(user, loginDto, response) {
    try {
      //jwt token
      const fundraiser: Fundraiser = user;
      if ((fundraiser.role == "FUNDRAISER" && await this.fundraiserService.getFundRaiserStatusByEmail(fundraiser.email) == "active") || (fundraiser.role == "ADMIN")) {
        const userPassword = await this.fundraiserRepository.findOne({ where: { email: fundraiser.email }, select: ["password"] })

        if (fundraiser && (await bcrypt.compare(loginDto.password, userPassword.password))) {
          const payload = {
            "firstName": fundraiser.firstName,
            "email": fundraiser.email,
            "role": fundraiser.role,
            "fundraiserId": fundraiser.fundraiser_id,
            "profileImage": fundraiser.profileImage
          }
          // return { token: this.jwtService.sign(payload) };
          return this.issueTokens(user, response); // Issue tokens on login

        }
        else {
          return null;
        }
      }
      else {
        return "Please contact the administrator";
      }

    } catch (error) {
      console.log(error);
    }
  }

  async sendEmailForgotPassword(email: string) {
    try {
      const user = await this.fundraiserService.findFundRaiserByEmail(email)
      if (!user) {
        throw new NotFoundException("User not found")
      }

      var randomstring = Math.random().toString(36).slice(-8);
      var body2 = {
        "firstName": user.firstName,
        "otp": randomstring
      }
      const dto: sendEmailDto = {
        recipients: [{ name: user.firstName, address: user.email }],
        subject: "Reset Password",
        html: "<p>Hi {firstName}, Reset password using:{otp} </p><p>Otp expires in<strong>10</strong>minutes</p>",
        placeholderReplacements: body2
      };
      await this.mailerService.sendMail(dto);

      let forgotPassword = new ForgottenPassword()
      forgotPassword.email = email
      forgotPassword.newPasswordToken = randomstring
      await this.forgottenPasswordRepository.save(forgotPassword)
      setTimeout(async () => {
        try {
          var user2 = await this.forgottenPasswordRepository.findOne({ where: { email: email } })
          await this.forgottenPasswordRepository.remove(user2)

        } catch {
          return true
        }
      }, 600000)
      return "true"
    } catch (error) {
      console.log(error);
    }

  }

  async setNewPassword(body) {
    try {
      var fundraiser = await this.forgottenPasswordRepository.findOne({ where: { newPasswordToken: body.otp } })
      if (!fundraiser) {
        throw new NotFoundException("Invalid Otp")
      }
      else {
        var user_new = await this.fundraiserService.findFundRaiserByEmail(fundraiser.email)
        const password = body.newPassword
        const hashedPassword = await bcrypt.hash(password, 10)
        var status = await this.fundraiserRepository.update(user_new.fundraiser_id, { password: hashedPassword })
        if (status) {
          await this.forgottenPasswordRepository.remove(fundraiser)
        }
        return "Success"

      }


    } catch (error) {
      console.log(error);
    }
  }


  async refreshToken(req, res) {
    const refreshToken = req.cookies['refresh_token'];
    console.log(refreshToken)
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    let payload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
      console.log(payload);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userExists = await this.fundraiserRepository.findOne({
      where: { fundraiser_id: payload.id },
    });

    if (!userExists) {
      throw new BadRequestException('User no longer exists');
    }

    const expiresIn = 30; // seconds
    const expiration = Math.floor(Date.now() / 1000) + expiresIn;
    console.log((Date.now()))
    const accessToken = this.jwtService.sign(
      { ...payload, exp: expiration },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      },
    );

    res.cookie('access_token', accessToken, { httpOnly: true });

    return { accessToken: accessToken };
  }

  async issueTokens(fundraiser: Fundraiser, response) {
    const payload = {
      "firstName": fundraiser.firstName,
      "email": fundraiser.email,
      "role": fundraiser.role,
      "fundraiserId": fundraiser.fundraiser_id,
      "profileImage": fundraiser.profileImage
    }

    const accessToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '30sec',
      },
    );

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });

    response.cookie('access_token', accessToken, { httpOnly: true, maxAge: 150000 });
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
    });
    return { accessToken: accessToken, refreshToken: refreshToken };
  }


}
