import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateFundraiserPageAdminDto {
  @ApiProperty({ description: `Enter Email Id`, example: `temp@gmail.com` })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase(), { toClassOnly: true })
  email: string;
}
