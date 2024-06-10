import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Oneclick1@' })
  @IsString()
  @IsNotEmpty({ message: 'Old Password is Required' })
  @Length(8)
  oldPassword: string;

  @ApiProperty({ example: 'Oneclick2@' })
  @IsString()
  @IsNotEmpty({ message: 'New Password is Required' })
  @Length(8)
  newPassword: string;

  @ApiProperty({ example: 'Oneclick2@' })
  @IsString()
  @IsNotEmpty({ message: 'Confirm Password is Required' })
  @Length(8)
  confirmPassword: string;
}
