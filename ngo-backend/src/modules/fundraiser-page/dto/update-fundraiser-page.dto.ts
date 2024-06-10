import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateFundraiserPageDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  @Min(1)
  target_amount: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  resolution: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  money_raised_for: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  story: string;

  // constructor(body?: any) {
  //     // Initialize the properties based on the provided body data, if any
  //     if (body) {
  //       // Assign the properties from the body to the DTO instance
  //       this.target_amount = body.target_amount;
  //       this.resolution = body.resolution;
  //       this.about = body.about;
  //       this.money_raised_for = body.money_raised_for;
  //       this.story = body.story;
  //     }
  //   }
}
