import { Body, Controller, Get, Post, Req, Res, UseGuards, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";

import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { LoginDto } from "./dto/login.dto";

import { Public } from "src/shared/decorators/public.decorator";

import { AuthService } from "./auth.service";

@ApiTags("Login")
@Controller("auth")
export class AuthController {

  constructor(
    private authService: AuthService,
  ) { }

  //Login Route
  @Post("/login")
  @UseGuards(AuthGuard("local"))
  @Public()
  async login(@Req() req, @Body(ValidationPipe) loginDto: LoginDto, @Res({ passthrough: true }) response) {
    return await this.authService.login(req.user, loginDto, response)
  }

  @Get("/refreshToken")
  async refreshTokens(@Req() req, @Res({ passthrough: true }) response) {
    return await this.authService.refreshToken(req, response)
  }


  //forgot password otp send
  @Get("forgot-password")
  @Public()
  public async sendEmailForgotPassword(@Body(ValidationPipe) body: ForgotPasswordDto) {
    return await this.authService.sendEmailForgotPassword(body.email);
  }

  //verify otp and update password
  @Post("reset-password")
  @Public()
  async setNewPassword(@Body(ValidationPipe) body: ResetPasswordDto) {
    await this.authService.setNewPassword(body)
  }

}