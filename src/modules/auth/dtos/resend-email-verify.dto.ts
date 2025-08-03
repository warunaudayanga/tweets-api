import { IsNotEmpty } from "class-validator";

export class ResendEmailVerifyDto {
    @IsNotEmpty()
    email: string;
}
