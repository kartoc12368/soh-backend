import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { IsAlpha, IsDate, IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';

export class AddOfflineDonationDto {
  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  @Type(() => IsEmail)
  email: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsAlpha()
  @IsNotEmpty()
  donor_name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pan: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  donor_email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  donor_phone: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  donor_address: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  donation_date: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  donor_city: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  donor_state: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  donor_country: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  donor_bankName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  donor_bankBranch: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  donor_pincode: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference_payment: string;
}
