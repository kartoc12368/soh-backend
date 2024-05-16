import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class GeneratePasswordDto {
  @ApiProperty({ example: 'kartavya.oc@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Kartavya' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  mobile_number: string;
}
