import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateFundraiserPageAdminDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
