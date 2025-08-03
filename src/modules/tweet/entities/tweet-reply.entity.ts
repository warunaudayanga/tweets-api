import { EntityId } from "@types";
import { TweetReply } from "../interfaces";
import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../core/base";
import { UserEntity } from "../../user/entities";
import { TweetEntity } from "./tweet.entity";

@Entity("tweet-replies")
export class TweetReplyEntity extends BaseEntity implements TweetReply {
    @Column()
    content: string;

    @ManyToOne(() => UserEntity, user => user.tweets)
    author: UserEntity;

    @Column({ nullable: true })
    authorId: EntityId | null;

    @ManyToOne(() => TweetEntity, tweet => tweet.replies)
    tweet: TweetEntity | null;

    @Column({ nullable: true })
    tweetId: EntityId | null;
}
