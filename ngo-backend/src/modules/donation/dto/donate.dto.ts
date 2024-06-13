import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

import { IsAlpha, IsDecimal, IsEmail, IsEnum, IsLowercase, IsNotEmpty, IsNumberString, IsOptional, IsString, Max, Min } from 'class-validator';
import { ProjectName } from 'src/shared/enums/project.enum';

export class DonateDto {
  @ApiProperty({ example: 100, maximum: 100000000, minimum: 1, type: 'float' })
  @IsNotEmpty()
  @Transform(({ value }) => Number.parseFloat(value))
  @Min(1)
  @Max(100000000)
  @IsDecimal()
  amount: number;

  @ApiProperty({ example: 'Kartavya' })
  @IsAlpha()
  @IsNotEmpty()
  donor_first_name: string;

  @ApiProperty({ example: 'Patel', required: false })
  @IsAlpha()
  @IsNotEmpty()
  @IsOptional()
  donor_last_name: string;

  @ApiProperty({ example: 'GAUPP1234E', required: false })
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

  @ApiProperty({ example: '407-412, President Plaza, opposite TITANIUM SQUARE, Jay Ambe Nagar, Patel Society, Jai Ambe Nagar, Thaltej, Ahmedabad, Gujarat 380054  ', required: false })
  @IsOptional()
  @IsString()
  donor_address: string;

  @ApiProperty({ example: 'Ahmedabad', required: false })
  @IsOptional()
  @IsString()
  donor_city: string;

  @ApiProperty({ example: 'Gujarat', required: false })
  @IsOptional()
  @IsString()
  donor_state: string;

  @ApiProperty({ example: 'India', required: false })
  @IsOptional()
  @IsString()
  donor_country: string;

  @ApiProperty({ example: '380054', required: false })
  @IsOptional()
  @IsString()
  donor_pincode: string;

  @ApiProperty({ example: 'pithu', required: false })
  @IsOptional()
  @IsEnum(ProjectName)
  project_name: string;

  @ApiProperty({ enum: { Yes: 'Yes', No: 'No' }, default: 'No' })
  @IsOptional()
  @IsEnum({ enum: { Yes: 'Yes', No: 'No' } })
  certificate: string;

  @ApiProperty({ example: 'Make it anonymous', required: false })
  @IsOptional()
  @IsString()
  comments: string;
}
