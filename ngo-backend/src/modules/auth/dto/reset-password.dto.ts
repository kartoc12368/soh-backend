import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, Length, Min } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'hjk56yuj' })
  @IsString()
  @Length(8)
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ example: 'Oneclick1@' })
  @IsString()
  @IsNotEmpty()
  @Length(6)
  newPassword: string;
}
