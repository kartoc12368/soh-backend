import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'hjk56yuj' })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({ example: 'Oneclick1@' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
