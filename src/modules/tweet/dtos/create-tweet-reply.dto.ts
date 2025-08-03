import { IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";
import { EntityId } from "@types";

export class CreateTweetReplyDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(280)
    content: string;

    @IsUUID()
    @IsNotEmpty()
    tweetId: EntityId;
}
