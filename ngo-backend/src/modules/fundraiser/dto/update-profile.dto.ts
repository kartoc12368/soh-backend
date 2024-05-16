import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';

export class UpdateFundraiserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty({ message: 'First Name is required' })
  @IsOptional()
  firstName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNumberString()
  mobile_number: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  profilePicture: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  pincode: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dob: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  pan: string;
}
