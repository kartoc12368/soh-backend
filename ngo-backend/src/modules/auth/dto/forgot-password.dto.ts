import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'kartavya.oc@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
