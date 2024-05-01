import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Public } from 'src/shared/decorators/public.decorator';
import { PaymentDto } from './dto/payment.dto';


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
  async paymentVerfications(@Body() body: any, @Res() res) {
    return await this.paymentService.paymentVerification(body, res);
  }

  @Get("/getKey")
  @Public()
  async getKey() {
    return await this.paymentService.getKey();
  }
}
