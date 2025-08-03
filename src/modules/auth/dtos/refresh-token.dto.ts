import { IsJWT, IsNotEmpty } from "class-validator";
import { RefreshToken } from "@types";

export class RefreshTokenDto {
    @IsJWT()
    @IsNotEmpty()
    refreshToken: RefreshToken;
}
