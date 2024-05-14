import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateFundraiserPageAdminDto {
  @ApiProperty({ description: `Enter Email Id`, example: `temp@gmail.com` })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
