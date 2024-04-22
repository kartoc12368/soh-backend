import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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
