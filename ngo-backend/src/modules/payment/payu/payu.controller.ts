import { Body, Controller, Param, Post, Query, Res } from '@nestjs/common';

import { Public } from 'src/shared/decorators/public.decorator';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PayUService } from './payu.service';

@ApiTags('Payment')
@Controller('payu')
export class PayUController {
  constructor(private readonly payUService: PayUService) {}

  @Post('/hash')
  @Public()
  async getHash(@Body() body) {
    console.log('hello');
    return await this.payUService.getHash(body);
  }

  @Post('/success')
  @Public()
  async paymentSuccess(@Body() body, @Res() res) {
    console.log(body);
    res.redirect('http://localhost:3000/login');
  }

  @Post('/failed')
  @Public()
  async paymentFailed(@Body() body, @Res() res) {
    console.log(body);
    res.redirect('http://localhost:3000/donate');
  }
}
