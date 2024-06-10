import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsString, Length, Min } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'kartavya.oc@gmail.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Oneclick1@' })
  @IsString()
  @Length(6)
  password: string;
}
