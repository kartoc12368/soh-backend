import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';

import { PaymentService } from './payment.service';

import { Public } from 'src/shared/decorators/public.decorator';

import { PaymentDto } from './dto/payment.dto';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post("/checkout/:reference")
  @Public()
  async checkout(@Body() body: PaymentDto, @Param("reference") reference: string) {
    console.log(reference)
    return await this.paymentService.checkout(body.amount, reference);
  }

  @Post("/paymentVerfications")
  @Public()
  async paymentVerfications(@Body() body: any, @Res() res, @Query() query: any) {
    return await this.paymentService.paymentVerification(body, res, query);
  }

}
