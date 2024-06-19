import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from 'src/shared/decorators/public.decorator';
import { PaymentService } from './payment.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('easypay')
@ApiTags('Easypay')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('donation')
  @Public()
  @ApiOperation({ summary: 'Initiating Donation (roles: user)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  async redirectUrl(@Body() body, @Res({ passthrough: true }) res) {
    return await this.paymentService.redirectUrl(res, body);
  }

  @Post('verification')
  @Public()
  @ApiOperation({ summary: 'Verifying Payment Response' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  async verify(@Body() body, @Res() res: any) {
    return await this.paymentService.verify(body, res);
  }

  @Post('push')
  @Public()
  @ApiOperation({ summary: 'Getting Transaction Data End of Day (roles: admin)' })
  @ApiResponse({ status: 201, description: 'Api success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found!' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error!' })
  async pushUrl(@Body() body) {
    return await this.paymentService.pushUrl(body);
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async findPendingPayment() {
    await this.paymentService.findPendingPayment();
  }
}
