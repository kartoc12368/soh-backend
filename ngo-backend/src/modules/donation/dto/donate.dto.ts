import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

import { IsAlpha, IsDecimal, IsEmail, IsEnum, IsLowercase, IsNotEmpty, IsNumberString, IsOptional, IsString, Min } from 'class-validator';
import { ProjectName } from 'src/shared/enums/project.enum';

export class DonateDto {
  @ApiProperty({ example: '100' })
  @IsNotEmpty()
  @Transform(({ value }) => Number.parseFloat(value))
  amount: number;

  @ApiProperty({ example: 'Kartavya' })
  @IsAlpha()
  @IsNotEmpty()
  donor_first_name: string;

  @ApiProperty({ example: 'Patel' })
  @IsAlpha()
  @IsNotEmpty()
  @IsOptional()
  donor_last_name: string;

  @ApiProperty({ example: 'GAUPP1234E' })
  @IsOptional()
  @IsString()
  pan: string;

  @ApiProperty({ example: 'kartavya.oc@gmail.com' })
  @IsOptional()
  @IsEmail()
  @Type(() => IsLowercase)
  donor_email: string;

  @ApiProperty({ example: '9870675678' })
  @IsNotEmpty()
  @IsNumberString()
  donor_phone: string;

  @ApiProperty({ example: '407-412, President Plaza, opposite TITANIUM SQUARE, Jay Ambe Nagar, Patel Society, Jai Ambe Nagar, Thaltej, Ahmedabad, Gujarat 380054  ' })
  @IsOptional()
  @IsString()
  donor_address: string;

  @ApiProperty({ example: 'Ahmedabad' })
  @IsOptional()
  @IsString()
  donor_city: string;

  @ApiProperty({ example: 'Gujarat' })
  @IsOptional()
  @IsString()
  donor_state: string;

  @ApiProperty({ example: 'India' })
  @IsOptional()
  @IsString()
  donor_country: string;

  @ApiProperty({ example: '380054' })
  @IsOptional()
  @IsString()
  donor_pincode: string;

  @ApiProperty({ example: 'pithu' })
  @IsOptional()
  @IsString()
  @IsEnum(ProjectName)
  project_name: string;

  @ApiProperty({ enum: { Yes: 'Yes', No: 'No' } })
  @IsOptional()
  @IsString()
  @IsEnum({ enum: { Yes: 'Yes', No: 'No' } })
  certificate: string;

  @ApiProperty({ example: 'Make it anonymous' })
  @IsOptional()
  @IsString()
  comments: string;

  @ApiProperty({ example: 'tyuh78hj' })
  @IsOptional()
  @IsString()
  txnid: string;
}
