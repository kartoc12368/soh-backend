import { Body, Controller, Get, Headers, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
  @ApiOperation({ summary: 'Login using email and password (roles: admin,fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  @Public()
  login(@Req() req, @Body(ValidationPipe) loginDto: LoginDto): Promise<ResponseStructure> {
    return this.authService.login(req?.user, loginDto);
  }

  @Get('/refreshToken')
  @ApiOperation({ summary: 'Get access token using refresh token (roles: admin,fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  @Public()
  refreshTokens(@Headers('refreshToken') refreshToken: string): Promise<ResponseStructure> {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Forgot Password to get OTP on mail (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  @Public()
  public sendEmailForgotPassword(@Body(ValidationPipe) body: ForgotPasswordDto): Promise<ResponseStructure> {
    return this.authService.sendEmailForgotPassword(body?.email);
  }

  //verify otp and update password
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset Password using mail OTP (roles: fundraiser)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  @Public()
  setNewPassword(@Body(ValidationPipe) body: ResetPasswordDto): Promise<ResponseStructure> {
    return this.authService.setNewPassword(body);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  expireOtp() {
    return this.authService.expireOtp();
  }
}
