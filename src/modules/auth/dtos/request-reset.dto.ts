import { IsNotEmpty } from "class-validator";

export class RequestResetDto {
    @IsNotEmpty()
    email: string;
}
