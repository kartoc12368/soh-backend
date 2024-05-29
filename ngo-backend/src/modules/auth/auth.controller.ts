import { Body, Controller, Get, Headers, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { Public } from 'src/shared/decorators/public.decorator';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';

import { AuthService } from './auth.service';

@ApiTags('Login')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Login using email and password' })
  @Public()
  async login(@Req() req, @Body(ValidationPipe) loginDto: LoginDto): Promise<ResponseStructure> {
    return await this.authService.login(req?.user, loginDto);
  }

  @Get('/refreshToken')
  @ApiOperation({ summary: 'Get access token using refresh token' })
  @Public()
  async refreshTokens(@Headers('refreshToken') refreshToken: string): Promise<ResponseStructure> {
    return await this.authService.refreshToken(refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot Password to get OTP on mail' })
  @Public()
  public async sendEmailForgotPassword(@Body(ValidationPipe) body: ForgotPasswordDto): Promise<ResponseStructure> {
    return await this.authService.sendEmailForgotPassword(body?.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset Password using mail OTP' })
  @Public()
  async setNewPassword(@Body(ValidationPipe) body: ResetPasswordDto): Promise<ResponseStructure> {
    return await this.authService.setNewPassword(body);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async deleteExpiredOtp() {
    return await this.authService.deleteExpiredOtp();
  }
}
