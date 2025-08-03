import { IsNotEmpty } from "class-validator";
import { VerifyToken } from "@types";

export class ResetPasswordDto {
    @IsNotEmpty()
    token: VerifyToken;

    @IsNotEmpty()
    password: string;
}
