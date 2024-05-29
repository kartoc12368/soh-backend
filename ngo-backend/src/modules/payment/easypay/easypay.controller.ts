import { Body, Controller, Post, Res } from '@nestjs/common';
import { EasypayService } from './easypay.service';
import { Public } from 'src/shared/decorators/public.decorator';
import { DonateDto } from 'src/modules/donation/dto/donate.dto';

@Controller('easypay')
export class EasypayController {
  constructor(private readonly easypayService: EasypayService) {}

  @Post('donation')
  @Public()
  async redirectUrl(@Body() body: DonateDto, @Res({ passthrough: true }) res) {
    return await this.easypayService.redirectUrl(res, body);
  }
}
