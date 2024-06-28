import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'kartavya.oc@gmail.com' })
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value.toLowerCase(), { toClassOnly: true })
  email: string;

  @ApiProperty({ example: 'Oneclick1@', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6)
  password: string;
}
