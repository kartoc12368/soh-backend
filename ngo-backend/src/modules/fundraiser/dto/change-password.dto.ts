import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Oneclick1@' })
  @IsString()
  @IsNotEmpty({ message: 'old password is required' })
  oldPassword: string;

  @ApiProperty({ example: 'Oneclick2@' })
  @IsString()
  @IsNotEmpty({ message: 'newpassword is required' })
  newPassword: string;

  @ApiProperty({ example: 'Oneclick2@' })
  @IsString()
  @IsNotEmpty({ message: 'confirmpassword is required' })
  confirmPassword: string;
}
