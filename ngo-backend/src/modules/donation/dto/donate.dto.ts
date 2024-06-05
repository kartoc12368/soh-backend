import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

import { IsAlpha, IsDecimal, IsEmail, IsLowercase, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

export class DonateDto {
  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => Number.parseFloat(value))
  amount: number;

  @ApiProperty()
  @IsAlpha()
  @IsNotEmpty()
  donor_first_name: string;

  @ApiProperty()
  @IsAlpha()
  @IsNotEmpty()
  @IsOptional()
  donor_last_name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  pan: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  @Type(() => IsLowercase)
  donor_email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  donor_phone: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  donor_address: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  donor_city: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  donor_state: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  donor_country: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  donor_pincode: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  project_name: string;

  @ApiProperty({ enum: { Yes: 'Yes', No: 'No' } })
  @IsOptional()
  @IsString()
  certificate: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  comments: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  txnid: string;
}
