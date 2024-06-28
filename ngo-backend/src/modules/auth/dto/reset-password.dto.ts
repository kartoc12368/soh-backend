import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'hjk56yuj', minLength: 8 })
  @IsString()
  @Length(8)
  @IsNotEmpty({ message: 'Otp is required' })
  otp: string;

  @ApiProperty({ example: 'Oneclick1@', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6)
  newPassword: string;
}
