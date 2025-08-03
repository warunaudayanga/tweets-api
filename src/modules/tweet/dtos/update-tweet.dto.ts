import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateTweetDto {
    @IsOptional()
    @IsString()
    @MaxLength(280)
    content?: string;

    @IsOptional()
    @IsString()
    media?: string;
}
