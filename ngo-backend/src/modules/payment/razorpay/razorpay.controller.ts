import { Body, Controller, Param, Post, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { Public } from 'src/shared/decorators/public.decorator';

import { PaymentDto } from '../dto/payment.dto';
import { RazorpayService } from './razorpay.service';

@ApiTags('Payment')
@Controller('payment')
export class RazorpayController {
  constructor(private readonly razorpayService: RazorpayService) {}

  @Post('/checkout/:reference')
  @ApiOperation({ summary: 'Checkout page for generating order id' })
  @Public()
  async checkout(@Body() body: PaymentDto, @Param('reference') reference: string): Promise<ResponseStructure> {
    console.log(reference);
    return await this.razorpayService.checkout(body?.amount, reference);
  }

  @Post('/paymentVerfications')
  @ApiOperation({ summary: 'Payment verification and payment status update  ' })
  @Public()
  async paymentVerfications(@Body() body, @Res() res, @Query() query): Promise<ResponseStructure> {
    return await this.razorpayService.paymentVerification(body, res, query);
  }

  @Cron(CronExpression.EVERY_30_MINUTES_BETWEEN_9AM_AND_5PM)
  // @Cron(CronExpression.EVERY_30_SECONDS)
  async findAll() {
    await this.razorpayService.findAll();
  }
}
