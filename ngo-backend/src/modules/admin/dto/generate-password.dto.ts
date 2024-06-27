import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { IsEmail, IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class GeneratePasswordDto {
  @ApiProperty({ example: 'kartavya.oc@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase(), { toClassOnly: true })
  email: string;

  @ApiProperty({ example: 'Kartavya' })
  @IsString()
  @IsNotEmpty({ message: 'First Name is Required' })
  firstName: string;

  @ApiProperty({ example: '1234567890', maxLength: 10 })
  @IsNotEmpty()
  @IsNumberString()
  mobile_number: string;
}
