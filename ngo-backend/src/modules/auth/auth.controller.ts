import { Body, Controller, Get, Post, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';

import { Public } from 'src/shared/decorators/public.decorator';

import { AuthService } from './auth.service';

@ApiTags('Login')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('/login')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: "Login using email and password" })
  @Public()
  async login(@Req() req, @Body(ValidationPipe) loginDto: LoginDto, @Res({ passthrough: true }) response) {
    return await this.authService.login(req.user, loginDto);
  }

  @Get('forgot-password')
  @ApiOperation({ summary: "Forgot Password to get OTP on mail" })
  @Public()
  public async sendEmailForgotPassword(@Body(ValidationPipe) body: ForgotPasswordDto) {
    console.log(body)
    return await this.authService.sendEmailForgotPassword(body.email);
  }

  //verify otp and update password
  @Post('reset-password')
  @ApiOperation({ summary: "Reset Password using mail OTP" })
  @Public()
  async setNewPassword(@Body(ValidationPipe) body: ResetPasswordDto) {
    await this.authService.setNewPassword(body);
  }
}
