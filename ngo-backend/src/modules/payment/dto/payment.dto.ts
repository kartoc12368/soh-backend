import { ApiProperty } from '@nestjs/swagger';

import { IsDecimal, IsNotEmpty, Max, Min } from 'class-validator';

export class PaymentDto {
  @ApiProperty({ type: 'float', example: 100 })
  @IsDecimal()
  @IsNotEmpty()
  @Min(1)
  @Max(100000000)
  amount: number;
}
