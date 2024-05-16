import { Body, Controller, Param, Post, Query, Res } from '@nestjs/common';

import { PaymentService } from './payment.service';

import { Public } from 'src/shared/decorators/public.decorator';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentDto } from './dto/payment.dto';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { Cron, CronExpression } from '@nestjs/schedule';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/checkout/:reference')
  @ApiOperation({ summary: 'Checkout page for generating order id' })
  @Public()
  async checkout(@Body() body: PaymentDto, @Param('reference') reference: string): Promise<ResponseStructure> {
    console.log(reference);
    return await this.paymentService.checkout(body?.amount, reference);
  }

  @Post('/paymentVerfications')
  @ApiOperation({ summary: 'Payment verification and payment status update  ' })
  @Public()
  async paymentVerfications(@Body() body, @Res() res, @Query() query): Promise<ResponseStructure> {
    return await this.paymentService.paymentVerification(body, res, query);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async findAll() {
    await this.paymentService.findAll();
  }
}
