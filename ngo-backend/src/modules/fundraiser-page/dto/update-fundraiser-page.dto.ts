import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateFundraiserPageDto {
  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @Min(1)
  target_amount: number;

  @ApiPropertyOptional({ example: 'lorem ipsum lorem ipsum' })
  @IsString()
  @IsOptional()
  resolution: string;

  @ApiPropertyOptional({ example: 'lorem ipsum lorem ipsum' })
  @IsString()
  @IsOptional()
  money_raised_for: string;

  @ApiPropertyOptional({ example: 'lorem ipsum lorem ipsum' })
  @IsString()
  @IsOptional()
  story: string;
}
