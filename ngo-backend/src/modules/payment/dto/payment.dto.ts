import { ApiProperty } from '@nestjs/swagger';

import { IsDecimal, IsNotEmpty } from 'class-validator';

export class PaymentDto {
    @ApiProperty()
    @IsDecimal()
    @IsNotEmpty()
    amount: number;

}
