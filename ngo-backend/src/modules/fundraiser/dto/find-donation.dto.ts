import { ApiProperty } from '@nestjs/swagger';

import { IsDate, IsOptional, IsString } from 'class-validator';

import { Type } from 'class-transformer';

export class FindDonationsDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  payment_option?: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  payment_status?: string;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  from_date?: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  to_date?: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  donation_id?: number;
}
