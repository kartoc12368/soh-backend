import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Param,
  NotFoundException,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from './auth.service';
import { FundraiserService } from '../fundraiser/fundraiser.service';
import { Public } from 'src/shared/decorators/public.decorator';
import { Fundraiser } from 'src/shared/entity/fundraiser.entity';
import { FundRaiserRepository } from '../fundraiser/fundraiser.repository';
import { ForgottenPasswordRepository } from './forgot-password.repo';

@ApiTags('Login')
@Controller('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private fundraiserService: FundraiserService,
    private authService: AuthService,
    private fundraiserRepository: FundRaiserRepository,
    private forgottenPasswordRepository: ForgottenPasswordRepository,
  ) {}

  //Login Route
  @UseGuards(AuthGuard('local'))
  @Public()
  @Post('/login')
  async login(
    @Req() req,
    @Body(ValidationPipe) loginDto: LoginDto,
    @Res({ passthrough: true }) response,
  ) {
    //jwt token
    const fundraiser: Fundraiser = req.user;
    if (
      (fundraiser.role == 'FUNDRAISER' &&
        (await this.fundraiserService.getFundRaiserStatusByEmail(
          fundraiser.email,
        )) == 'active') ||
      fundraiser.role == 'ADMIN'
    ) {
      const userPassword = await this.fundraiserRepository.findOne({
        where: { email: fundraiser.email },
        select: ['password'],
      });

      if (
        fundraiser &&
        (await bcrypt.compare(loginDto.password, userPassword.password))
      ) {
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
  }

  //forgot password otp send
  @Public()
  @Get('forgot-password')
  public async sendEmailForgotPassword(
    @Body(ValidationPipe) body: ForgotPasswordDto,
  ) {
    return await this.authService.sendEmailForgotPassword(body.email);
  }

  //verify otp and update password
  @Public()
  @Post('reset-password')
  async setNewPassword(@Body(ValidationPipe) body: ResetPasswordDto) {
    var fundraiser = await this.forgottenPasswordRepository.findOne({
      where: { newPasswordToken: body.otp },
    });
    if (!fundraiser) {
      throw new NotFoundException('Invalid Otp');
    } else {
      var user_new = await this.fundraiserService.findFundRaiserByEmail(
        fundraiser.email,
      );
      const password = body.newPassword;
      const hashedPassword = await bcrypt.hash(password, 10);
      var status = await this.fundraiserRepository.update(
        user_new.fundraiser_id,
        { password: hashedPassword },
      );
      if (status) {
        await this.forgottenPasswordRepository.remove(fundraiser);
      }
      return 'Success';
    }
  }
}
