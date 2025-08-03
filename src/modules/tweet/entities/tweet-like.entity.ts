import { EntityId } from "@types";
import { Tweet, TweetLike } from "../interfaces";
import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../core/base";
import { UserEntity } from "../../user/entities";
import { TweetEntity } from "./tweet.entity";

@Entity("tweet-likes")
export class TweetLikeEntity extends BaseEntity implements TweetLike {
    @ManyToOne(() => TweetEntity, tweet => tweet.likes)
    tweet: Tweet | null;

    @Column({ nullable: true })
    tweetId: EntityId | null;

    @ManyToOne(() => UserEntity, user => user.tweets)
    user: UserEntity | null;

    @Column({ nullable: true })
    userId: EntityId | null;
}
