import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsDecimal, IsNotEmpty,IsNumberString, IsOptional, IsString} from "class-validator";

export class DonateDto{

    @ApiProperty()
    @IsDecimal()
    @IsNotEmpty()
    amount:number

    @ApiProperty()
    @IsAlpha()
    @IsNotEmpty()
    donor_name:string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    pan:string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    donor_email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumberString()
    donor_phone: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    donor_address: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    comments:string;

}