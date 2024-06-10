import { ApiProperty } from '@nestjs/swagger';

import { IsDecimal, IsNotEmpty, Min } from 'class-validator';

export class PaymentDto {
  @ApiProperty()
  @IsDecimal()
  @IsNotEmpty()
  @Min(1)
  amount: number;
}
