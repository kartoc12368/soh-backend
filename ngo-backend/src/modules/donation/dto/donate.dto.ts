import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

import { IsAlpha, IsEmail, IsEnum, IsLowercase, IsNotEmpty, IsNumber, IsNumberString, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
import { CertificateStatus } from 'src/shared/enums/certificate.enum';
import { ProjectName } from 'src/shared/enums/project.enum';

export class DonateDto {
  @ApiProperty({ example: 100, maximum: 100000000, minimum: 1, type: 'float' })
  @IsNotEmpty()
  @Type(() => Number)
  @Min(1.0)
  @Max(100000000.0)
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @ApiProperty({ example: 'Kartavya' })
  @IsAlpha()
  @IsNotEmpty()
  donor_first_name: string;

  @ApiProperty({ example: 'Patel', required: false })
  @IsAlpha()
  @IsOptional()
  donor_last_name: string;

  @ApiProperty({ example: 'GAUPP1234E', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.toUpperCase(), { toClassOnly: true })
  pan: string;

  @ApiProperty({ example: 'kartavya.oc@gmail.com' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase(), { toClassOnly: true })
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

  @ApiProperty({ enum: CertificateStatus, default: CertificateStatus.FALSE })
  @IsOptional()
  @IsEnum(CertificateStatus)
  @Transform(({ value }) => (value === true ? CertificateStatus.TRUE : CertificateStatus.FALSE))
  certificate: string;

  @ApiProperty({ example: 'Make it anonymous', required: false })
  @IsOptional()
  @IsString()
  comments: string;

  @ApiProperty({ example: 'Make it anonymous', required: false })
  @IsOptional()
  @IsObject()
  donation_activity: object;
}
