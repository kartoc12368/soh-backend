import { Body, Controller, Param, Post, Query, Res } from '@nestjs/common';

import { PaymentService } from './payment.service';

import { Public } from 'src/shared/decorators/public.decorator';

import { ApiTags } from '@nestjs/swagger';
import { PaymentDto } from './dto/payment.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/checkout/:reference')
  @Public()
  async checkout(@Body() body: PaymentDto, @Param('reference') reference: string) {
    console.log(reference);
    return await this.paymentService.checkout(body.amount, reference);
  }

  @Post('/paymentVerfications')
  @Public()
  async paymentVerfications(@Body() body, @Res() res, @Query() query) {
    return await this.paymentService.paymentVerification(body, res, query);
  }
}
