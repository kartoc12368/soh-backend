import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { IsAlpha, IsDate, IsEmail, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';

export class AddOfflineDonationDto {
  @ApiPropertyOptional({ example: 'kartavya.oc@gmail.com' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'Hardik' })
  @IsAlpha()
  @IsNotEmpty()
  donor_first_name: string;

  @ApiPropertyOptional({ example: 'HARDI0110K' })
  @IsOptional()
  @IsString()
  pan: string;

  @ApiPropertyOptional({ example: 'hardiksaresa.oc@gmail.com' })
  @IsOptional()
  @IsString()
  donor_email: string;

  @ApiProperty({ example: '1234567890' })
  @IsNotEmpty()
  @IsNumberString()
  donor_phone: number;

  @ApiPropertyOptional({ example: 'Keas 69 Str. 15234, Chalandri Athens,Greece' })
  @IsOptional()
  @IsString()
  donor_address: string;

  @ApiPropertyOptional({ example: 'Keep Anonymous' })
  @IsOptional()
  @IsString()
  comments: string;

  @ApiPropertyOptional({ example: '2024/09/02' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  donation_date: Date;

  @ApiPropertyOptional({ example: 'Ahmedabad' })
  @IsOptional()
  @IsString()
  donor_city: string;

  @ApiPropertyOptional({ example: 'Gujarat' })
  @IsOptional()
  @IsString()
  donor_state: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsOptional()
  @IsString()
  donor_country: string;

  @ApiPropertyOptional({ example: 'HDFC Bank' })
  @IsOptional()
  @IsString()
  donor_bank_name: string;

  @ApiPropertyOptional({ example: 'Thaltej' })
  @IsOptional()
  @IsString()
  donor_bank_branch: string;

  @ApiPropertyOptional({ example: '456789' })
  @IsOptional()
  @IsNumber()
  donor_pincode: number;

  @ApiPropertyOptional({ example: 'HTYUHJKL' })
  @IsOptional()
  @IsString()
  reference_payment: string;

  @ApiPropertyOptional({ example: 'Cash' })
  @IsOptional()
  @IsString()
  payment_method: string;
}
