import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class CreateFundraiserPageAdminDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

}
