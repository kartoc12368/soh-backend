import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { IsDate, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Length } from 'class-validator';

export class UpdateFundraiserDto {
  @ApiPropertyOptional({ example: 'Kartavya' })
  @IsString()
  @IsNotEmpty({ message: 'First Name is Required' })
  @IsOptional()
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(), { toClassOnly: true })
  firstName: string;

  @ApiPropertyOptional({ example: 'Patel' })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(), { toClassOnly: true })
  lastName: string;

  @ApiPropertyOptional({ example: '9265908056' })
  @IsOptional()
  @IsNumberString()
  mobile_number: string;

  @ApiPropertyOptional({ example: 'profile.jpeg' })
  @IsString()
  @IsOptional()
  profilePicture: string;

  @ApiPropertyOptional({ example: 'lorem ipsum dolor sit amet' })
  @IsString()
  @IsOptional()
  address: string;

  @ApiPropertyOptional({ example: 'Ahmedabad' })
  @IsString()
  @IsOptional()
  city: string;

  @ApiPropertyOptional({ example: 'Gujarat' })
  @IsString()
  @IsOptional()
  state: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsString()
  @IsOptional()
  country: string;

  @ApiPropertyOptional({ example: 380060 })
  @IsNumber()
  @IsOptional()
  pincode: number;

  @ApiPropertyOptional({ example: '06/06/2024' })
  @IsDate()
  @IsOptional()
  dob: Date;

  @ApiPropertyOptional({ example: 'AOCXX4500X' })
  @IsString()
  @IsOptional()
  pan: string;
}
