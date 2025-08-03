import { IsNotEmpty, IsOptional, IsUrl } from "class-validator";
import { VerifyToken } from "@types";

export class EmailVerifyDto {
    @IsNotEmpty()
    token: VerifyToken;

    @IsUrl()
    @IsOptional()
    redirectUrl?: string;
}
