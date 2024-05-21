import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

import { IsAlpha, IsDecimal, IsEmail, IsLowercase, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';

export class DonateDto {
  @ApiProperty()
  @IsNotEmpty()
  // @Type(() => Number)
  @Transform(({ value }) => Number.parseFloat(value))
  amount: number;

  @ApiProperty()
  @IsAlpha()
  @IsNotEmpty()
  donor_name: string;

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
  comments: string;
}
