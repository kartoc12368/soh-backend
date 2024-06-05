import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from 'src/shared/decorators/public.decorator';
import { EasypayService } from './easypay.service';

@Controller('easypay')
@ApiTags('Easypay')
export class EasypayController {
  constructor(private readonly easypayService: EasypayService) {}

  @Post('donation')
  @Public()
  async redirectUrl(@Body() body, @Res({ passthrough: true }) res) {
    return await this.easypayService.redirectUrl(res, body);
  }

  @Post('verification')
  async verify(@Body() body) {
    return await this.easypayService.verify(body);
  }

  @Post('push')
  @Public()
  async pushUrl(@Body() body) {
    return await this.easypayService.pushUrl(body);
  }
}
