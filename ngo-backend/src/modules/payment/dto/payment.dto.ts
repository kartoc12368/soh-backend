import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

import { IsDecimal, IsNotEmpty, IsNumber } from 'class-validator';

export class PaymentDto {
    @ApiProperty()
    @IsDecimal()
    @IsNotEmpty()
    amount: number;

}
