import { IsNotEmpty } from "class-validator";
import { VerifyToken } from "@types";

export class ResetPasswordTokenVerifyDto {
    @IsNotEmpty()
    token: VerifyToken;
}
