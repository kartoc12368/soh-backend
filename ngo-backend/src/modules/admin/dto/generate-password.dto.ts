import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { IsEmail, IsNotEmpty, IsNumberString, IsString, Matches } from 'class-validator';

export class GeneratePasswordDto {
  @ApiProperty({ example: 'kartavya.oc@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase(), { toClassOnly: true })
  email: string;

  @ApiProperty({ example: 'Kartavya' })
  @IsString()
  @IsNotEmpty({ message: 'First Name is Required' })
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(), { toClassOnly: true })
  firstName: string;

  @ApiProperty({ example: '1234567890', maxLength: 10 })
  @IsNotEmpty()
  @IsNumberString()
  @Matches(/^\d{3}-\d{3}-\d{4}$/, { message: 'Mobile number must be in the format XXX-XXX-XXXX' })
  mobile_number: string;
}
