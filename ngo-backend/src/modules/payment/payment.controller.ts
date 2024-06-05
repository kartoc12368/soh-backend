import { Body, Controller, Param, Post, Query, Res } from '@nestjs/common';

import { PaymentService } from './payment.service';

import { Public } from 'src/shared/decorators/public.decorator';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentDto } from './dto/payment.dto';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';
import { Cron, CronExpression } from '@nestjs/schedule';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/checkout/:reference')
  @ApiOperation({ summary: 'Checkout page for generating order id (roles: user)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  @Public()
  checkout(@Body() body: PaymentDto, @Param('reference') reference: string): Promise<ResponseStructure> {
    console.log(reference);
    return this.paymentService.checkout(body?.amount, reference);
  }

  @Post('/paymentVerfications')
  @ApiOperation({ summary: 'Payment verification and payment status update (roles: user) ' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  @Public()
  paymentVerfications(@Body() body, @Res() res, @Query() query): Promise<ResponseStructure> {
    return this.paymentService.paymentVerification(body, res, query);
  }

  @Cron(CronExpression.EVERY_30_MINUTES_BETWEEN_9AM_AND_5PM)
  findAll() {
    this.paymentService.findAll();
  }
}
