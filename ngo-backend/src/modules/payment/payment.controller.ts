import { Body, Controller, Param, Post, Query, Res } from '@nestjs/common';

import { PaymentService } from './payment.service';

import { Public } from 'src/shared/decorators/public.decorator';

import { ApiTags } from '@nestjs/swagger';
import { PaymentDto } from './dto/payment.dto';
import { ResponseStructure } from 'src/shared/interface/response-structure.interface';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/checkout/:reference')
  @Public()
  async checkout(@Body() body: PaymentDto, @Param('reference') reference: string): Promise<ResponseStructure> {
    console.log(reference);
    return await this.paymentService.checkout(body.amount, reference);
  }

  @Post('/paymentVerfications')
  @Public()
  async paymentVerfications(@Body() body, @Res() res, @Query() query): Promise<ResponseStructure> {
    return await this.paymentService.paymentVerification(body, res, query);
  }
}
