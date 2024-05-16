import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsDate, IsOptional, IsString } from 'class-validator';

import { Type } from 'class-transformer';
import { PaymentType } from 'src/shared/enums/payment-type.enum';
import { PaymentStatus } from 'src/shared/enums/payment-status.enum';

export class FindDonationsDto {
  @ApiPropertyOptional({ enum: PaymentType })
  @IsString()
  @IsOptional()
  payment_option: string;

  @IsString()
  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  payment_status: string;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  from_date: string;

  @ApiPropertyOptional()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  to_date: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  donation_id: number;
}
