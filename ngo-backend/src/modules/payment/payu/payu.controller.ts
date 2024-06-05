import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from 'src/shared/decorators/public.decorator';

import { PayUService } from './payu.service';

@ApiTags('Payu')
@Controller('payu')
export class PayUController {
  constructor(private readonly payUService: PayUService) {}

  @Post('/hash')
  @Public()
  async getHash(@Body() body) {
    return await this.payUService.getHash(body);
  }

  @Post('/success')
  @Public()
  async paymentSuccess(@Body() body, @Res() res) {
    console.log(body);
    await this.payUService.success(body);
    res.redirect('http://localhost:3000/login');
  }

  @Post('/failed')
  @Public()
  async paymentFailed(@Body() body, @Res() res) {
    res.redirect('http://localhost:3000/donate');
  }
}
