import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ChangePasswordDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({message:"old password is required"})
    oldPassword: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty({message:"newpassword is required"})
    newPassword: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty({message:"confirmpassword is required"})
    confirmPassword: string;


}
