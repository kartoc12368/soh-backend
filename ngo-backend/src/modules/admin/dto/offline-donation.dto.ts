import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { IsAlpha, IsDate, IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Max, Min } from 'class-validator';

export class AddOfflineDonationDto {
  @ApiPropertyOptional({ example: 'kartavya.oc@gmail.com', required: false })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ example: 100, maximum: 100000000, minimum: 1, type: 'float' })
  @IsNotEmpty()
  @Type(() => Number)
  @Min(1.0)
  @Max(100000000.0)
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @ApiProperty({ example: 'Hardik' })
  @IsAlpha()
  @IsNotEmpty()
  donor_first_name: string;

  @ApiPropertyOptional({ example: 'HARDI0110K', maxLength: 10, required: false })
  @IsOptional()
  @IsString()
  pan: string;

  @ApiPropertyOptional({ example: 'hardiksaresa.oc@gmail.com', required: false })
  @IsOptional()
  @IsEmail()
  donor_email: string;

  @ApiProperty({ example: '1234567890', maxLength: 10 })
  @IsNotEmpty()
  @IsNumberString()
  donor_phone: number;

  @ApiPropertyOptional({ example: 'Keas 69 Str. 15234, Chalandri Athens,Greece', required: false })
  @IsOptional()
  @IsString()
  donor_address: string;

  @ApiPropertyOptional({ example: 'Keep Anonymous', required: false })
  @IsOptional()
  @IsString()
  comments: string;

  @ApiPropertyOptional({ example: '2024/09/02', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  donation_date: Date;

  @ApiPropertyOptional({ example: 'Ahmedabad', required: false })
  @IsOptional()
  @IsString()
  donor_city: string;

  @ApiPropertyOptional({ example: 'Gujarat', required: false })
  @IsOptional()
  @IsString()
  donor_state: string;

  @ApiPropertyOptional({ example: 'India', required: false })
  @IsOptional()
  @IsString()
  donor_country: string;

  @ApiPropertyOptional({ example: 'HDFC Bank', required: false })
  @IsOptional()
  @IsString()
  donor_bank_name: string;

  @ApiPropertyOptional({ example: 'Thaltej', required: false })
  @IsOptional()
  @IsString()
  donor_bank_branch: string;

  @ApiPropertyOptional({ example: '456789', required: false })
  @IsOptional()
  @IsNumber()
  donor_pincode: number;

  @ApiPropertyOptional({ example: 'HTYUHJKL', required: false })
  @IsOptional()
  @IsString()
  reference_payment: string;

  @ApiPropertyOptional({ example: 'Cash', required: false })
  @IsOptional()
  @IsString()
  payment_method: string;
}
