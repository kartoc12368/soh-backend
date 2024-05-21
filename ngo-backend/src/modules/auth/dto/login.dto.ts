import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'kartavya.oc@gmail.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'Oneclick1@' })
  @IsString()
  password: string;
}
