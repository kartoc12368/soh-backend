import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class GeneratePasswordDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: "First name is required" })
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  mobile_number: string;
}
