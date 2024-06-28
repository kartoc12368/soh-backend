import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class PaymentDto {
  @ApiProperty({ example: 100, maximum: 100000000, minimum: 1, type: 'float' })
  @IsNotEmpty()
  @Type(() => Number)
  @Min(1.0)
  @Max(100000000.0)
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;
}
